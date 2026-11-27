# YNS Theme 219

A port of Your Next Store theme 219 ("Lazora") to React Router v8 framework mode. The storefront is self-contained: a static Store API and cart run inside the app, so no second server or external API URL is needed.

## Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open http://localhost:5173. The storefront includes the home page, catalog browsing, product detail (variants, subscriptions, bundles, reviews), search, a cookie-backed cart with a demo order flow, contact, blog, legal pages, FAQ, about, order confirmation, and generated product OG images. Checkout/account and durable persistence are still outstanding (see [Not implemented yet](#not-implemented-yet)).

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

| Path                    | Purpose                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| `/`                     | Home: banner carousel, shop tiles, product grid                                 |
| `/products`             | Catalog listing with sort, category filter, and pagination                      |
| `/product/:slug`        | Product detail: gallery, variants, subscriptions, bundles, reviews, add-to-cart |
| `/product/:slug/og.png` | Generated 1200×630 Open Graph image                                             |
| `/category/:slug`       | Category-filtered listing                                                       |
| `/collection/:slug`     | Collection detail with its products                                             |
| `/search`               | Search results (`?q=`), sorted and paginated                                    |
| `/faq`                  | Static FAQ with Base UI accordions                                              |
| `/about`                | Editorial about page                                                            |
| `/contact`              | Feature-flagged contact form                                                    |
| `/legal/:slug`          | Feature-flagged legal pages (terms, privacy, returns)                           |
| `/blog`                 | Blog index with Tiptap-rendered previews                                        |
| `/blog/:slug`           | Blog post with Tiptap content and product embeds                                |
| `/order/success/:id`    | Fixture-backed order confirmation                                               |
| `/cart`                 | Cart resource route (loader + action)                                           |
| `/newsletter`           | Newsletter signup action (POST)                                                 |
| `/restock`              | Sold-out restock notification action (POST)                                     |
| `/reviews`              | Product review submission action (POST)                                         |
| `/chat`                 | Store chat action (POST)                                                        |
| `/api/v1/*`             | Static Store API resource route                                                 |
| `/sitemap.xml`          | Sitemap of pages, categories, products, blog posts and legal pages              |
| `/robots.txt`           | Robots policy pointing at the sitemap                                           |

The listing routes (`/products`, `/category/:slug`, `/search`) share `ListingControls`, `ListingPagination`, `ProductCard`, and `NoProducts`. Sort (`sort`), page (`page`), and category (`category`) are query parameters.

## Cart and mock API

The cart is cookie-backed and supports `add`, `add-bundle`, `set-quantity`, `remove`, `apply-coupon`, `remove-coupon`, and `place-order` intents via form submissions to `/cart`. Line identity includes the selected variant, subscription plan and bundle selections; volume tiers, plan discounts and coupons are applied server-side. The header cart button opens a sidebar with line items, quantity controls, and a discount code field. `place-order` snapshots the cart into the fixture-backed order store and navigates to `/order/success/:id` (the documented swap seam for real checkout).

The mock Store API supports `me`, `products`, `products/filters`, `products/reviews`, `categories`, `collections`, `posts`, `socials`, `legal-pages`, `orders`, and `brands`, with `limit`, `offset`, `query`, `category`, and `active` parameters on product listings. All list responses use a `{ data, meta }` envelope.

```bash
curl http://localhost:5173/api/v1/products?limit=2
curl http://localhost:5173/api/v1/me
```

## SEO

Route modules export `meta` functions for titles, canonical URLs, Open Graph/Twitter tags, and JSON-LD structured data (WebSite, Product with reviews, and listing pages). Product pages point their OG/Twitter image at `/product/:slug/og.png`, generated on demand with Satori + resvg. `/sitemap.xml` and `/robots.txt` are resource routes.

## Project layout

- `app/root.tsx` — document shell, global chrome (`Header`, `Footer`), cart `Provider`, global overlays (newsletter dialog, cookie consent, store chat), and root metadata.
- `app/routes.ts` — `autoRoutes()`; routes come from files under `app/routes/` (`index.tsx` → `/`, `$param` → dynamic segment, `+/` → route-scoped files, `.ts` → resource route).
- `app/routes/` — route modules. `index.tsx`, `about.tsx`, `products.tsx`, `search.tsx`, `category.$slug.tsx`, `collection.$slug.tsx`, `contact.tsx`, `cart.ts`, `chat.ts`, `newsletter.ts`, `restock.ts`, `reviews.ts`, `order.success.$id.tsx`, and the SEO routes are flat files; `blog/`, `faq/`, `legal/` and `product/$slug/` are folders because they have scoped data, components and the OG image route.
- `app/components/` — shared components in PascalCase single files (including `TiptapRenderer`, `QuickAddButton`, `CookieConsent`, `NewsletterConsent`, `NewsletterDialog`, `StoreChat`); `app/components/cart/` holds the cart provider, sidebar, button, line item, add-to-cart button, and discount field; installed shadcn/Base UI primitives live in `app/components/ui/`.
- `app/lib/` — shared helpers: `cart/` (types, pricing math, cookie handling), `bundles/`, `variants/`, plus `catalog-sort.ts`, `product-grid.ts`, `pricing.ts`, `format-money.ts`, `format-date.ts`, `display.ts`, `volume-pricing.ts`, and `utils.ts`.
- `app/lib/mock-store/` — server-only data layer (`fixtures.server.ts`, `handlers.server.ts`, `catalog.server.ts`, `cart.server.ts`, `config.server.ts`, `editorial.server.ts`, `contact.server.ts`, `newsletter.server.ts`, `restock.server.ts`, `reviews.server.ts`, `chat.server.ts`, `orders.server.ts`, `types.ts`). Route loaders call it and return plain data; components never import it.
- `app/assets/css/app.css` — Tailwind v4 tokens, fonts, and utilities; `app/assets/fonts/` carries Geist for OG image rendering.
- `public/` — static assets served at their reference URLs: `/images/pexels/*.jpg`, `/logo.svg`, `/favicon.ico`.

## Not implemented yet

Real checkout/account proxy zones (the demo `place-order` flow is the swap seam), durable cart/order persistence beyond the in-process `Map`s, real email delivery, AI/streaming chat and chat product cards, analytics (only the `yns:consent` event exists today), and the prerendered-shell/Lighthouse gates from the source project.
