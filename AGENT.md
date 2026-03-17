# AGENT.md

This file provides repository-specific guidance for coding agents working in this project.

## Source Of Truth

- Use [`event_coordination_system_prd (1).md`](./event_coordination_system_prd%20%281%29.md) as the product source of truth.
- Keep changes aligned with the ECS domain: external trade fairs and industry events, not generic internal training workflows.

## Core Rules

- Prefer small end-to-end changes over broad speculative refactors.
- Prefer robust fixes over shortcuts and one-off workarounds.
- Never hardcode passwords, API keys, or other secrets in committed code or config.
- Do not mark work complete while relevant checks are failing.

## Feature Hygiene

- Before adding a new feature, check whether similar files or modules already exist and extend or consolidate them instead of duplicating patterns.
- Remove obsolete, superseded, or no-longer-used files as part of the same change when it is safe to do so.
- Update the relevant `README.md` files when project structure, setup steps, or developer workflows change.
- Store longer-form project documentation in `docs/` instead of scattering ad hoc markdown files across the repository. Create `docs/` when a change needs that documentation and the directory does not exist yet.

## Domain Guardrails

- Preserve the role model: `employee`, `manager`, `marketing`, `event_admin`.
- Preserve the event lifecycle: `draft -> proposed -> approved -> planned -> executed`, with `cancelled` only from non-terminal states.
- Keep participation and approval flows role-aware.
- Treat auditability as part of the feature, not optional plumbing. When changing create, update, delete, or transition flows, keep audit logging consistent.
- When changing event dates, status, or attendance flows, consider downstream effects on reminders, tasks, checklist items, and calendar coordination.

## Language Policy

- Code, comments, docs, commits, and PR text: English
- User-facing copy and business-domain text may be German where that matches the existing product behavior
- Keep code identifiers in English unless an existing domain term is already established

## Codebase Patterns

### Backend

- Stack: Fastify, Zod, Drizzle ORM, Vitest, ESM TypeScript
- Validate request bodies at the route boundary with `zod`
- Use the existing `AppError` subclasses for consistent API errors
- Keep local TypeScript import paths using `.js` extensions
- Reuse `authenticate` and `requirePermission(...)` for protected routes instead of ad hoc permission checks

### Frontend

- Stack: React 19, Vite, TypeScript
- Follow the existing project patterns before introducing new libraries or state-management approaches
- Keep UI aligned with the PRD direction: professional, modern, restrained B2B styling

## Verification

Run checks from the package directory you changed.

### Backend

```bash
cd backend
npm run lint
npm run format:check
npm run typecheck
npm run test
```

Use `npm run test`, not `npm run test:watch`, for non-interactive verification.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

If you change database schema or persistence logic, also consider whether Drizzle migration artifacts or schema commands are required.

## Git Guardrails

- Do not push unless explicitly asked
- Do not amend commits unless explicitly asked
- Do not force-push
