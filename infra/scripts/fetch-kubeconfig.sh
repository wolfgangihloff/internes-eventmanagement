#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
TF_DIR="${ROOT_DIR}/infra/terraform"
SSH_USER="${SSH_USER:-root}"
SSH_PRIVATE_KEY_PATH="${SSH_PRIVATE_KEY_PATH:-$HOME/.ssh/id_ed25519}"
OUTPUT_PATH="${1:-${ROOT_DIR}/.kube/internes-eventmanagement.yaml}"

if [[ ! -f "${SSH_PRIVATE_KEY_PATH}" ]]; then
  echo "SSH private key not found at ${SSH_PRIVATE_KEY_PATH}."
  exit 1
fi

server_ip="$(terraform -chdir="${TF_DIR}" output -raw server_public_ipv4)"
mkdir -p "$(dirname "${OUTPUT_PATH}")"

ssh \
  -i "${SSH_PRIVATE_KEY_PATH}" \
  -o StrictHostKeyChecking=accept-new \
  -o BatchMode=yes \
  "${SSH_USER}@${server_ip}" \
  "sudo cat /etc/rancher/k3s/k3s.yaml" \
  | sed "s/127.0.0.1/${server_ip}/g" > "${OUTPUT_PATH}"

chmod 600 "${OUTPUT_PATH}"
echo "Wrote kubeconfig to ${OUTPUT_PATH}"
