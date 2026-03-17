# Hetzner k3s deployment

This repository now contains the minimum application-side scaffolding to deploy to a k3s cluster on Hetzner:

- container build targets for `backend`, `backend-migrator`, and `frontend`
- Kubernetes manifests for PostgreSQL, Redis, backend, frontend, and ingress
- GitHub Actions for CI and for image publish plus k3s rollout

## Secret handling

- The root `.env` is ignored via the repository-level `.gitignore`.
- `git log -- .env backend/.env deploy/.env` currently returns no history, so no env file has been committed in this repository state.
- Keep the Hetzner API token in local `.env` or GitHub Secrets only. Do not add it to Kubernetes manifests.

## Hetzner prerequisites

Before the manifests in `deploy/k8s/` can work in production, the cluster needs:

1. A running k3s cluster on Hetzner.
2. Hetzner Cloud Controller Manager installed if you want native load balancer integration.
3. Hetzner CSI installed with a storage class named `hcloud-volumes`.
4. Traefik or another ingress controller available in-cluster.
5. A DNS record pointing your app host to the ingress endpoint.
6. Optional but recommended: `cert-manager` for automated TLS certificates.
7. A GitHub runner secret `KUBE_CONFIG_DATA` containing a base64-encoded kubeconfig for the cluster.
8. Either public GHCR packages or a Kubernetes image pull secret for GHCR.

If you also want the cluster itself provisioned from GitHub, the next step is separate infrastructure-as-code for Hetzner servers, networking, firewalls, and k3s bootstrap. That is not yet in this repository.

## Required GitHub configuration

Add these repository secrets:

- `KUBE_CONFIG_DATA`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `JWT_SECRET`
- `ANTHROPIC_API_KEY` (optional, can be left empty)

Add these repository variables:

- `INGRESS_HOST`
- `INGRESS_TLS_SECRET` (optional, defaults to `internes-eventmanagement-tls`)

If the GHCR packages are private, also create a pull secret in the namespace and wire it into the backend, frontend, and migration job specs before rollout.

## Deploy flow

On `main`, `.github/workflows/deploy-k3s.yml` will:

1. build and push container images to GHCR
2. create or update the Kubernetes secret from GitHub Secrets
3. apply the base manifests in `deploy/k8s/`
4. run the database sync job
5. apply the ingress manifest with your configured host
6. wait for frontend and backend rollouts

## Important database note

The backend currently has no checked-in Drizzle migration files under `backend/src/db/migrations/`.
Because of that, the deploy workflow uses `npm run db:push` through the `backend-migrator` image to synchronize the schema.

That is acceptable as an initial bootstrap mechanism, but it is not a strong long-term migration strategy. Before wider production usage, generate and commit explicit Drizzle migrations and switch the job from `db:push` to `db:migrate`.

## Manual rollout

For a manual deploy after creating the Kubernetes secret:

```bash
kubectl apply -k deploy/k8s
kubectl -n internes-eventmanagement delete job backend-migrate --ignore-not-found
kubectl -n internes-eventmanagement apply -f deploy/k8s/backend-migrate.job.yaml
sed \
  -e "s|\${INGRESS_HOST}|events.example.com|g" \
  -e "s|\${INGRESS_TLS_SECRET}|internes-eventmanagement-tls|g" \
  deploy/k8s/ingress.template.yaml | kubectl apply -f -
```
