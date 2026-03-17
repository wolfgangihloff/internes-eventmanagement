#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
TF_DIR="${ROOT_DIR}/infra/terraform"
SSH_USER="${SSH_USER:-root}"
SSH_PRIVATE_KEY_PATH="${SSH_PRIVATE_KEY_PATH:-$HOME/.ssh/id_ed25519}"
HCLOUD_TOKEN="${HCLOUD_TOKEN:-}"
CCM_VERSION="${CCM_VERSION:-v1.30.1}"
CSI_VERSION="${CSI_VERSION:-v2.20.0}"
CERT_MANAGER_VERSION="${CERT_MANAGER_VERSION:-v1.20.0}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"

if [[ -z "${HCLOUD_TOKEN}" ]]; then
  echo "HCLOUD_TOKEN is required in the environment."
  exit 1
fi

if [[ ! -f "${SSH_PRIVATE_KEY_PATH}" ]]; then
  echo "SSH private key not found at ${SSH_PRIVATE_KEY_PATH}."
  exit 1
fi

server_ip="$(terraform -chdir="${TF_DIR}" output -raw server_public_ipv4)"
network_id="$(terraform -chdir="${TF_DIR}" output -raw network_id)"
location="$(terraform -chdir="${TF_DIR}" output -raw location)"

ssh_opts=(
  -i "${SSH_PRIVATE_KEY_PATH}"
  -o StrictHostKeyChecking=accept-new
  -o BatchMode=yes
  -o ConnectTimeout=10
)

echo "Waiting for SSH on ${server_ip}..."
for _ in $(seq 1 60); do
  if ssh "${ssh_opts[@]}" "${SSH_USER}@${server_ip}" true >/dev/null 2>&1; then
    break
  fi
  sleep 5
done

echo "Bootstrapping Hetzner addons on ${server_ip}..."
ssh "${ssh_opts[@]}" "${SSH_USER}@${server_ip}" "sudo bash -s" <<EOF
set -euo pipefail

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

if ! command -v helm >/dev/null 2>&1; then
  curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

until sudo k3s kubectl get nodes >/dev/null 2>&1; do
  sleep 5
done

cat <<MANIFEST | sudo k3s kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: hcloud
  namespace: kube-system
type: Opaque
stringData:
  token: ${HCLOUD_TOKEN}
  network: "${network_id}"
MANIFEST

sudo k3s kubectl apply -f "https://github.com/hetznercloud/hcloud-cloud-controller-manager/releases/download/${CCM_VERSION}/ccm.yaml"

helm repo add hcloud https://charts.hetzner.cloud
helm repo add jetstack https://charts.jetstack.io
helm repo update

cat <<VALUES >/tmp/hcloud-csi-values.yaml
controller:
  hcloudVolumeDefaultLocation: ${location}
  hcloudToken:
    existingSecret:
      name: hcloud
      key: token
  priorityClassName: system-cluster-critical
node:
  hostNetwork: true
  priorityClassName: system-node-critical
VALUES

helm upgrade --install hcloud-csi hcloud/hcloud-csi \
  --namespace kube-system \
  --create-namespace \
  --version "${CSI_VERSION#v}" \
  -f /tmp/hcloud-csi-values.yaml

helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version "${CERT_MANAGER_VERSION#v}" \
  --set crds.enabled=true

sudo k3s kubectl -n kube-system wait --for=condition=available deployment/hcloud-cloud-controller-manager --timeout=5m
sudo k3s kubectl -n kube-system wait --for=condition=available deployment/hcloud-csi-controller --timeout=5m
sudo k3s kubectl -n cert-manager wait --for=condition=available deployment/cert-manager --timeout=5m
sudo k3s kubectl -n cert-manager wait --for=condition=available deployment/cert-manager-webhook --timeout=5m
sudo k3s kubectl -n cert-manager wait --for=condition=available deployment/cert-manager-cainjector --timeout=5m

if [[ -n "${LETSENCRYPT_EMAIL}" ]]; then
  cat <<MANIFEST | sudo k3s kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: ${LETSENCRYPT_EMAIL}
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            ingressClassName: traefik
MANIFEST
fi
EOF

echo "Hetzner CCM, CSI, and cert-manager bootstrap completed."
