# Event Management System (EMS)

Internal tool for coordinating participation in external trade fairs and industry events. Replaces scattered emails, spreadsheets, and implicit knowledge with a structured workflow for event selection, approval, preparation, attendance, and follow-up.

## Demo & Documentation

| Resource | URL |
|----------|-----|
| Application | https://5.161.34.169.nip.io/login |
| Storybook | https://5.161.34.169.nip.io/storybook |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Fastify 5, TypeScript (ESM), Drizzle ORM, postgres.js, BullMQ + Redis |
| Frontend | React 19, Vite, shadcn/ui, TanStack Query v5, Zustand, React Router v7 |
| Database | PostgreSQL 16 |
| Auth | JWT access tokens + refresh tokens, argon2id password hashing |
| AI | Claude API for event analysis suggestions |
| Docs | Storybook 10 (MDX docs under `frontend/src/docs/`) |

## Quick Start (Local Dev)

### Prerequisites

- Node.js 22+
- Docker / Rancher Desktop (for PostgreSQL + Redis)

### 1. Start Database & Redis

```bash
cd backend
# Docker Desktop:
docker compose up -d
# Rancher Desktop (containerd):
nerdctl compose up -d
```

### 2. Start Backend

```bash
cd backend
cp .env.example .env   # adjust PORT if 3000 is taken
npm install
npx drizzle-kit push
npm run dev             # runs on http://localhost:3001
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev             # runs on http://localhost:5173
```

### 4. Start Storybook

```bash
cd frontend
npm run storybook       # runs on http://localhost:6006
```

### 5. Create First Admin User

```bash
# Register via API
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Test1234!","displayName":"Admin"}'

# Grant admin roles
nerdctl exec backend-postgres-1 psql -U ecs -d ecs -c \
  "INSERT INTO user_roles (id, user_id, role) SELECT gen_random_uuid(), id, r.role FROM users, unnest(ARRAY['event_admin','marketing','manager']) AS r(role) WHERE email='admin@example.com' ON CONFLICT (user_id, role) DO NOTHING;"
```

## Verification

```bash
# Backend
cd backend
npx tsc --noEmit
CI=1 npx vitest run

# Frontend
cd frontend
npx tsc --noEmit
npx eslint .
npm run build

# Storybook
cd frontend
npm run build-storybook
```

## Project Structure

```
internes-eventmanagement/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Fastify instance factory
│   │   ├── config.ts           # Typed env config
│   │   ├── db/schema/          # Drizzle table definitions
│   │   ├── domain/             # Event state machine, error classes
│   │   ├── services/           # Business logic per domain
│   │   ├── routes/             # Fastify route plugins
│   │   ├── middleware/         # Auth, RBAC, error handling
│   │   └── lib/                # JWT, password, logging, LLM client
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── features/           # Feature-based modules (auth, events, admin, ...)
│   │   ├── components/         # Shared UI + layout components
│   │   ├── docs/               # Storybook MDX documentation
│   │   ├── api/                # Axios client + interceptors
│   │   └── types/              # TypeScript interfaces
│   └── .storybook/
├── deploy/                     # Production Docker Compose + Kubernetes
├── AGENT.md                    # Agent coding conventions
└── README.md                   # This file
```

## Key Concepts

- **Event Lifecycle**: `draft → proposed → approved → planned → executed` (+ `cancelled`)
- **Roles**: `employee`, `manager`, `marketing`, `event_admin`
- **Participation Workflow**: apply → approve/reject → confirm
- **Audit Logging**: All mutations are tracked in `audit_log`

For detailed documentation, see the [Storybook](https://5.161.34.169.nip.io/storybook).
