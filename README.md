# yns-theme-219

A port of Your Next Store theme 219 ("Lazora") to React Router v8 framework mode. The storefront is self-contained: a static Store API runs inside the app, so no second server or external API URL is needed.

## Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open http://localhost:5173. The home page, `/faq`, and `/about` are implemented; links to product, category, collection, search, cart, and account pages are currently placeholders.

## Scripts

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `bun run dev`       | Development server with HMR               |
| `bun run build`     | Production build into `build/`            |
| `bun run start`     | Serve the production build                |
| `bun run typecheck` | Generate route types, then run TypeScript |
| `bun run lint`      | Lint with oxlint                          |
| `bun run lint:fix`  | Lint and apply fixes                      |
| `bun run fmt`       | Format with oxfmt                         |
| `bun run fmt:check` | Check formatting                          |

## Routes and mock API

| Path        | Purpose                                         |
| ----------- | ----------------------------------------------- |
| `/`         | Home: banner carousel, shop tiles, product grid |
| `/faq`      | Static FAQ with Base UI accordions              |
| `/about`    | Editorial about page                            |
| `/api/v1/*` | Static Store API resource route                 |

The mock API supports `me`, `products`, `products/filters`, `categories`, `collections`, `socials`, `legal-pages`, and `brands`, with `limit`, `offset`, `query`, `category`, and `active` parameters on product listings. All responses use a `{ data, meta }` envelope.

```bash
curl http://localhost:5173/api/v1/products?limit=2
curl http://localhost:5173/api/v1/me
```

## Project layout

- `app/root.tsx` — document shell, global chrome (`Header`, `Footer`), providers, route-level meta.
- `app/routes.ts` — `autoRoutes()`; routes come from files under `app/routes/` (`index.tsx` → `/`, `$param` → dynamic segment, `+/` → route-scoped files).
- `app/routes/` — route modules. `index.tsx` and `about.tsx` are flat files; `faq/` is a folder because it has scoped data and a component.
- `app/components/` — shared components in PascalCase single files; installed shadcn/Base UI primitives live in `app/components/ui/`.
- `app/lib/mock-store/` — server-only data layer (`fixtures.server.ts`, `handlers.server.ts`, `catalog.server.ts`, `config.server.ts`, `editorial.server.ts`, `types.ts`). Route loaders call it and return plain data; components never import it.
- `app/assets/css/app.css` — Tailwind v4 tokens, fonts, and utilities.
- `public/` — static assets served at their reference URLs: `/images/pexels/*.jpg`, `/logo.svg`.

No `"use client"` directive is used: React Router framework mode creates client/server boundaries through `.client.ts` / `.server.ts` file suffixes.

## Not implemented yet

Cart state and add-to-cart, checkout/account, `/product/:slug`, `/products`, `/category/*`, `/collection/*`, `/search` results, blog/contact, newsletter dialog, store chat, consent banner, and SEO extras (sitemap/robots/JSON-LD).
