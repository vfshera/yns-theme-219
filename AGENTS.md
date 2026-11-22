# Repository Guidelines

## Package manager

Use `bun` (`bun add`, `bun run`). Common scripts: `bun run dev`, `bun run typecheck`, `bun run build`, `bun run lint`, `bun run fmt`.

## React Router guidance

- This is a React Router v8 **framework-mode** app (`@react-router/dev`, `react-router.config.ts`, `app/routes.ts`, `app/routes/`).
- Before changing routing, route modules, loaders/actions, navigation, or rendering config, load the `react-router` skill (project copy at `.agents/skills/react-router/`; start with `references/framework-mode.md`) and the `react-router-framework-mode` skill, then follow their relevant `references/*.md`.
- The installed `react-router@8.5.2` package ships local markdown docs under `node_modules/react-router/docs/`, so read those as the source of truth when the references point there; use the version-matched official docs at https://reactrouter.com/docs only as a fallback if local docs are absent. Respect `[MODES: ...]` markers and check feature version requirements before applying guidance.

## Routing

- `app/routes.ts` exports `autoRoutes()` from `react-router-auto-routes` — don't hand-write route config.
- Library conventions: `index.tsx` → `/`, `$param` → dynamic segment, `_layout.tsx` → layout, `_`-prefixed folder → pathless group.

## Code organization

- Global components in `app/components/`:
  - Prefer single-file components (SFC): PascalCase filenames, e.g. `app/components/UserCard.tsx`.
  - Multi-file components use a kebab-case folder with an `index.tsx` entry, e.g. `app/components/data-table/index.tsx` with helper files beside it; import as `~/components/data-table`.
- Global utils in `app/lib/`:
  - Single-file utils are flat: `app/lib/format-date.ts`.
  - Multi-file utils get a folder: `app/lib/auth/` containing universal files plus `.client.ts` / `.server.ts` parts, e.g. `auth/shared.ts`, `auth/session.client.ts`, `auth/session.server.ts`.
  - React Router treats `.server.ts` and `.client.ts` files as server-only/client-only modules — never import one across that boundary. Route modules themselves must not use these suffixes.
- Assets always live under `app/assets/` (import via `~/assets/...`):
  - `app/assets/css/` — all global CSS, e.g. `app/assets/css/app.css`.
  - `app/assets/fonts/` — any local fonts added to the project.
  - `app/assets/images/` — all images, imported from there (e.g. `~/assets/images/logo.svg`).
- Images are **never colocated**: every image, whether global or used by a single route, lives in `app/assets/images/`. Do not place image files in a route's `+/` folder — that folder is for route-scoped components and utils only.
- Use the `~/*` path alias (maps to `app/*`).
- Route-scoped components/utils live in a single, flat `+/` folder inside that route's directory:
  ```
  app/routes/dashboard/
  ├── index.tsx
  └── +/
      ├── Header.tsx
      └── helpers.ts
  ```
- Keep files directly inside `+/` — no nested subfolders. Never place `+` entries at the `app/routes/` root, and never use the name `+types` (reserved for React Router typegen).
