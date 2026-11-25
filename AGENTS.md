# Repository Guidelines

## Package manager

Use `bun` (`bun add`, `bun run`). Common scripts: `bun run dev`, `bun run typecheck`, `bun run build`, `bun run lint`, `bun run fmt`. Run the shadcn CLI as `bunx --bun shadcn@latest` (the installed shadcn skill's examples use `npx`; substitute the bun runner). Do not hand-edit files under `.agents/skills/` — `skills-lock.json` records their hashes.

## React Router guidance

- This is a React Router v8 **framework-mode** app (`@react-router/dev`, `react-router.config.ts`, `app/routes.ts`, `app/routes/`).
- Before changing routing, route modules, loaders/actions, navigation, or rendering config, load the `react-router` skill (project copy at `.agents/skills/react-router/`; start with `references/framework-mode.md`) and the `react-router-framework-mode` skill, then follow their relevant `references/*.md`.
- The installed `react-router@8.5.2` package ships local markdown docs under `node_modules/react-router/docs/`, so read those as the source of truth when the references point there; use the version-matched official docs at https://reactrouter.com/docs only as a fallback if local docs are absent. Respect `[MODES: ...]` markers and check feature version requirements before applying guidance.
- React Router has no `"use client"` directive. Ported components use hooks directly; client/server boundaries come only from `.client.ts`/`.server.ts` suffixes. Do not add `use client` to any file.

## Routing

- `app/routes.ts` exports `autoRoutes()` from `react-router-auto-routes` — don't hand-write route config.
- Library conventions: `index.tsx` → `/`, `$param` → dynamic segment, `_layout.tsx` → layout, `_`-prefixed folder → pathless group.
- Resource routes (no default UI export — only `loader`/`action`) use the **`.ts` extension**; routes that render a component use `.tsx`. Example: `app/routes/api/v1/$.ts` serves `/api/v1/*`. Route-scoped components in `+/` stay `.tsx`; route-scoped utils stay `.ts`.
- Prefer flat route files (`app/routes/about.tsx`). Create a route folder only when the route has scoped files (`app/routes/faq/index.tsx` plus `app/routes/faq/+/faq-data.ts`).
- Render app-wide chrome (header, footer, cart) in `app/root.tsx`. Don't add a pathless group solely to hold chrome for a single-shell storefront.

## Code organization

- Global components in `app/components/`:
  - Prefer single-file components (SFC): PascalCase filenames, e.g. `app/components/UserCard.tsx`.
  - If a single file exports multiple components (typically because they share data or types), name the file kebab-case, e.g. `app/components/order-summary.tsx` exporting `OrderSummary` and `OrderSummaryLine`.
  - Multi-file components use a kebab-case folder with an `index.tsx` entry, e.g. `app/components/data-table/index.tsx` with helper files beside it; import as `~/components/data-table`.
  - `app/components/` is for components used in more than one place. A component used by only one route belongs in that route's `+/` folder instead.
- Global utils in `app/lib/`:
  - Single-file utils are flat and kebab-case: `app/lib/format-date.ts`.
  - Multi-file utils get a kebab-case folder, e.g. `app/lib/auth/`. It can contain files usable on both sides (`auth/shared.ts`, `auth/types.ts`), client-only parts (`auth/session.client.ts`), server-only parts (`auth/session.server.ts`), or any mix of them. Use a suffix only when the code must stay on one side.
  - React Router treats `.server.ts` and `.client.ts` files as server-only/client-only modules — never import one across that boundary. Route modules themselves must not use these suffixes.
- Assets usually live under `app/assets/` (import via `~/assets/...`):
  - `app/assets/css/` — all global CSS, e.g. `app/assets/css/app.css`.
  - `app/assets/fonts/` — any local fonts added to the project.
  - `app/assets/images/` — images imported from there (e.g. `~/assets/images/logo.svg?jsx`).
- Exception: static assets backing the **static mock API** are served from `public/` at their reference URLs — `public/images/pexels/*.jpg` → `/images/pexels/*.jpg` and `public/logo.svg` → `/logo.svg`. The fixtures are literal paths, so no bundler import is needed. Other images still go in `app/assets/images/`.
- Images are **never colocated** in route folders: no image file belongs in a route's `+/` folder — that folder is for route-scoped components and utils only.
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
