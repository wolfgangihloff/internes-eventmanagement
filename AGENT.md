# AGENT.md

This file provides repository-specific guidance for coding agents working in this project.

## Source Of Truth

- Use [`event_coordination_system_prd (1).md`](./event_coordination_system_prd%20%281%29.md) as the product source of truth.
- Keep changes aligned with the ECS domain: external trade fairs and industry events, not generic internal training workflows.
- **Storybook** (`frontend/src/docs/`) is the living documentation. Update relevant MDX pages when features change.
- **Demo**: https://5.161.34.169.nip.io/login | **Storybook**: https://5.161.34.169.nip.io/storybook

## Core Rules

- Prefer small end-to-end changes over broad speculative refactors.
- Prefer robust fixes over shortcuts and one-off workarounds.
- Never hardcode passwords, API keys, or other secrets in committed code or config.
- Do not mark work complete while relevant checks are failing.

## Feature Hygiene

- Before adding a new feature, check whether similar files or modules already exist and extend or consolidate them instead of duplicating patterns.
- Remove obsolete, superseded, or no-longer-used files as part of the same change when it is safe to do so.
- Store longer-form project documentation in Storybook (`frontend/src/docs/`) as MDX pages.
- Update the Storybook Lessons Learned page (`AgenticCoding.mdx`) with new patterns or pitfalls discovered during development.

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

- Stack: Fastify 5, Zod, Drizzle ORM, Vitest, ESM TypeScript
- Validate request bodies at the route boundary with `zod`
- Use the existing `AppError` subclasses for consistent API errors
- Keep local TypeScript import paths using `.js` extensions (except in `db/schema/` where drizzle-kit requires extensionless imports)
- Reuse `authenticate` and `requirePermission(...)` for protected routes instead of ad hoc permission checks
- New features follow: Schema → Service → Route → Tests

### Frontend

- Stack: React 19, Vite, TypeScript, shadcn/ui, TanStack Query v5, Zustand (with persist)
- Follow the existing project patterns before introducing new libraries or state-management approaches
- Keep UI aligned with the PRD direction: professional, modern, restrained B2B styling
- New features follow: Type → Hook → Component → Route wiring
- Auth state is persisted in localStorage via Zustand `persist` middleware

### Storybook

- Docs-only setup under `frontend/src/docs/` (MDX pages)
- Uses custom `DocsPage`, `DocCard`, `DocGrid`, `DocTable`, `Callout`, `Pill` components from `docs/components/`
- Build with `npm run build-storybook`, served under `/storybook/` in production

## Verification

Run checks from the package directory you changed.

### Backend

```bash
cd backend
npx tsc --noEmit
CI=1 npx vitest run
```

### Frontend

```bash
cd frontend
npx tsc --noEmit
npx eslint .
npm run build
```

### Storybook

```bash
cd frontend
npm run build-storybook
```

If you change database schema or persistence logic, also consider whether Drizzle migration artifacts or schema commands are required.

## Git Guardrails

- Do not push unless explicitly asked
- Do not amend commits unless explicitly asked
- Do not force-push
