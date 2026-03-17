#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
HCLOUD_TOKEN="${HCLOUD_TOKEN:-}"
SSH_PUBLIC_KEY_PATH="${SSH_PUBLIC_KEY_PATH:-$HOME/.ssh/id_ed25519.pub}"
KUBECONFIG_PATH="${KUBECONFIG_PATH:-${ROOT_DIR}/.kube/internes-eventmanagement.yaml}"

if [[ -z "${HCLOUD_TOKEN}" ]]; then
  echo "HCLOUD_TOKEN is required in the environment."
  exit 1
fi

if [[ ! -f "${SSH_PUBLIC_KEY_PATH}" ]]; then
  echo "SSH public key not found at ${SSH_PUBLIC_KEY_PATH}."
  exit 1
fi

gh secret set HCLOUD_TOKEN --body "${HCLOUD_TOKEN}"
gh variable set SSH_PUBLIC_KEY --body "$(cat "${SSH_PUBLIC_KEY_PATH}")"

if [[ -f "${KUBECONFIG_PATH}" ]]; then
  base64 < "${KUBECONFIG_PATH}" | tr -d '\n' | gh secret set KUBE_CONFIG_DATA
fi

for secret_name in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB JWT_SECRET ANTHROPIC_API_KEY; do
  if [[ -n "${!secret_name:-}" ]]; then
    gh secret set "${secret_name}" --body "${!secret_name}"
  fi
done

for variable_name in INGRESS_HOST INGRESS_TLS_SECRET; do
  if [[ -n "${!variable_name:-}" ]]; then
    gh variable set "${variable_name}" --body "${!variable_name}"
  fi
done

echo "GitHub repo configuration updated."
