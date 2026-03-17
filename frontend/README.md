# ECS Frontend

This frontend now uses Storybook as the documentation hub for the Event Coordination System. The first documentation pass focuses on:

- the overall product manual
- the current backend architecture and API surface

## Commands

```bash
npm install
npm run dev
npm run docs:audit
npm run docs:check
npm run storybook
npm run build-storybook
```

## Storybook Structure

The documentation lives under `src/docs` and is organized in the Storybook sidebar:

- `Start`: intro and documentation scope
- `Product`: product manual and operating model
- `Backend`: architecture, API surface, roles, and run instructions

## Notes

- Storybook is pinned to the current `10.2.x` line.
- The frontend uses a Vite 7.x toolchain so Storybook and `@tailwindcss/vite` resolve cleanly together.
- `npm run docs:audit` validates that backend routes, permissions, env vars, and event transitions are still reflected in the MDX docs.
- `npm run docs:check` runs the audit plus a full Storybook production build.
