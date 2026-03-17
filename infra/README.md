# Terraform Infra

This directory provisions the base Hetzner infrastructure for a single-node k3s cluster and includes helper scripts for the post-provision bootstrap.

The flow is split on purpose:

1. Terraform creates the server, firewall, network, and Hetzner SSH key.
2. A local bootstrap script connects over SSH and installs the Hetzner CCM, CSI driver, and optional cert-manager setup.
3. A kubeconfig helper fetches the cluster config and can publish it to GitHub Actions.

The Hetzner API token is not embedded into Terraform `user_data`, so it does not need to live in Terraform state.

## Layout

- `terraform/`: Hetzner infrastructure
- `scripts/bootstrap-hetzner-addons.sh`: installs CCM, CSI, and optional cert-manager after `terraform apply`
- `scripts/fetch-kubeconfig.sh`: retrieves kubeconfig from the server
- `scripts/publish-github-secrets.sh`: syncs low-risk repo configuration via `gh`

## Baseline assumptions

- single-node k3s for initial deployment
- Ubuntu 24.04 on Hetzner
- default ingress via bundled Traefik
- Hetzner Load Balancer created later by the cloud controller manager for the Traefik `LoadBalancer` service

This is not HA. It is the smallest viable production-like baseline for the current repository. If you want a multi-node control plane, the Terraform should be extended before applying it.

## Quick start

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
$EDITOR terraform.tfvars

set -a
source ../../.env
set +a
export HCLOUD_TOKEN="${HETZNER_API_KEY}"
terraform init
terraform apply

cd ../..
LETSENCRYPT_EMAIL="ops@example.com" HCLOUD_TOKEN="$HCLOUD_TOKEN" ./infra/scripts/bootstrap-hetzner-addons.sh
./infra/scripts/fetch-kubeconfig.sh
./infra/scripts/publish-github-secrets.sh
```

If `LETSENCRYPT_EMAIL` is set, the bootstrap script also installs cert-manager and creates a `ClusterIssuer` named `letsencrypt-prod` for Traefik HTTP-01 certificates.

## GitHub sync

`publish-github-secrets.sh` will:

- set `HCLOUD_TOKEN` from the current shell environment
- set the repo variable `SSH_PUBLIC_KEY` from `~/.ssh/id_ed25519.pub` by default
- set `KUBE_CONFIG_DATA` if a kubeconfig file exists at `.kube/internes-eventmanagement.yaml`
- optionally sync `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `INGRESS_HOST`, and `INGRESS_TLS_SECRET` when those env vars are exported

It does not create app secrets like `POSTGRES_PASSWORD` or `JWT_SECRET`, because those should be chosen explicitly rather than guessed.
