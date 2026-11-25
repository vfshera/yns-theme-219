# yns-theme-219

A port of Your Next Store theme 219 ("Lazora") to React Router v8 framework mode. The storefront is self-contained: a static Store API and cart run inside the app, so no second server or external API URL is needed.

## Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open http://localhost:5173. The home page, catalog browsing, product detail, search, cart, `/faq`, and `/about` are implemented; checkout/account and a few marketing pages are still outstanding (see [Not implemented yet](#not-implemented-yet)).

## Scripts

| Command              | What it does                              |
| -------------------- | ----------------------------------------- |
| `bun run dev`        | Development server with HMR               |
| `bun run build`      | Production build into `build/`            |
| `bun run start`      | Serve the production build                |
| `bun run typecheck`  | Generate route types, then run TypeScript |
| `bun run lint`       | Lint with oxlint                          |
| `bun run lint:fix`   | Lint and apply fixes                      |
| `bun run fmt`        | Format with oxfmt                         |
| `bun run fmt:check`  | Check formatting                          |
| `bun run commit`     | Create a conventional commit with git-cz  |
| `bun run commitlint` | Validate a commit message (git hook)      |

## Routes

| Path                  | Purpose                                                        |
| --------------------- | -------------------------------------------------------------- |
| `/`                   | Home: banner carousel, shop tiles, product grid                 |
| `/products`           | Catalog listing with sort, category filter, and pagination      |
| `/product/:slug`      | Product detail: gallery, variants, related products, add-to-cart |
| `/category/:slug`     | Category-filtered listing                                       |
| `/collection/:slug`   | Collection detail with its products                             |
| `/search`             | Search results (`?q=`), sorted and paginated                     |
| `/faq`                | Static FAQ with Base UI accordions                              |
| `/about`              | Editorial about page                                            |
| `/cart`               | Cart resource route (loader + action)                           |
| `/api/v1/*`           | Static Store API resource route                                 |
| `/sitemap.xml`        | Sitemap of static pages, categories, and products               |
| `/robots.txt`         | Robots policy pointing at the sitemap                           |

The listing routes (`/products`, `/category/:slug`, `/search`) share `ListingControls`, `ListingPagination`, `ProductCard`, and `NoProducts`. Sort (`sort`), page (`page`), and category (`category`) are query parameters.

## Cart and mock API

The cart is cookie-backed and supports `add`, `set-quantity`, `remove`, `apply-coupon`, and `remove-coupon` intents via form submissions to `/cart`. The header cart button opens a sidebar with line items, quantity controls, and a discount code field.

The mock Store API supports `me`, `products`, `products/filters`, `categories`, `collections`, `socials`, `legal-pages`, and `brands`, with `limit`, `offset`, `query`, `category`, and `active` parameters on product listings. All responses use a `{ data, meta }` envelope.

```bash
curl http://localhost:5173/api/v1/products?limit=2
curl http://localhost:5173/api/v1/me
```

## SEO

Route modules export `meta` functions for titles, canonical URLs, Open Graph/Twitter tags, and JSON-LD structured data (WebSite, Product, and listing pages). `/sitemap.xml` and `/robots.txt` are resource routes.

## Project layout

- `app/root.tsx` — document shell, global chrome (`Header`, `Footer`), cart `Provider`, and root metadata.
- `app/routes.ts` — `autoRoutes()`; routes come from files under `app/routes/` (`index.tsx` → `/`, `$param` → dynamic segment, `+/` → route-scoped files, `.ts` → resource route).
- `app/routes/` — route modules. `index.tsx`, `about.tsx`, `products.tsx`, `search.tsx`, `category.$slug.tsx`, `collection.$slug.tsx`, `cart.ts`, and the SEO routes are flat files; `faq/` and `product/` are folders because they have scoped data and components.
- `app/components/` — shared components in PascalCase single files; `app/components/cart/` holds the cart provider, sidebar, button, line item, add-to-cart button, and discount field; installed shadcn/Base UI primitives live in `app/components/ui/`.
- `app/lib/` — shared helpers: `cart/` (types, pricing math, cookie handling) plus `catalog-sort.ts`, `product-grid.ts`, `pricing.ts`, `format-money.ts`, `display.ts`, and `utils.ts`.
- `app/lib/mock-store/` — server-only data layer (`fixtures.server.ts`, `handlers.server.ts`, `catalog.server.ts`, `cart.server.ts`, `config.server.ts`, `editorial.server.ts`, `types.ts`). Route loaders call it and return plain data; components never import it.
- `app/assets/css/app.css` — Tailwind v4 tokens, fonts, and utilities.
- `public/` — static assets served at their reference URLs: `/images/pexels/*.jpg`, `/logo.svg`, `/favicon.ico`.

No `"use client"` directive is used: React Router framework mode creates client/server boundaries through `.client.ts` / `.server.ts` file suffixes.

## Not implemented yet

Checkout/account flows, `/blog` and `/contact` pages, the newsletter signup action (the footer field is currently inert), store chat, and the consent banner.
