import type { Route } from "./+types/search";
import { Link } from "react-router";
import { SearchIcon } from "lucide-react";
import { ListingControls } from "~/components/ListingControls";
import { ListingPagination } from "~/components/ListingPagination";
import { NoProducts } from "~/components/NoProducts";
import { ProductCard } from "~/components/ProductCard";
import { Button } from "~/components/ui/button";
import { type CatalogSort, parseSort } from "~/lib/catalog-sort";
import { PRODUCT_GRID } from "~/lib/product-grid";
import {
  getCategoryOptions,
  parsePage,
  searchProducts,
} from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";

export function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  const page = parsePage(params.get("page"));
  const sort: CatalogSort = parseSort(params.get("sort"));
  const category = params.get("category") ?? "";

  const listing = query
    ? searchProducts({ query, page, sort, category: category || undefined })
    : { products: [], count: 0, page: 1, totalPages: 1 };

  return {
    query,
    ...listing,
    sort,
    category,
    categories: getCategoryOptions(),
    config: getStoreConfig(),
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, location }) => {
  const { storeName, storeDescription } = matches[0].loaderData.info;
  const origin = matches[0].loaderData.origin;
  const url = `${origin}${location.pathname}`;
  const description =
    storeDescription ??
    "Considered things for everyday living, in soft colours and simple shapes.";
  const title = loaderData.query
    ? `Search: ${loaderData.query} | ${storeName}`
    : `Search | ${storeName}`;

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "noindex, follow" },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export default function Search({ loaderData }: Route.ComponentProps) {
  const {
    query,
    products,
    count,
    page,
    totalPages,
    sort,
    category,
    categories,
    config,
  } = loaderData;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      <form method="get" action="/search" className="mx-auto max-w-3xl">
        <label htmlFor="search-q" className="sr-only">
          Search products
        </label>
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search-q"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products"
            className="h-12 w-full rounded-md border border-input bg-background pr-24 pl-11 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
          >
            Search
          </Button>
        </div>
      </form>

      {query ? (
        <>
          <header className="pt-10 pb-8 sm:pt-14 sm:pb-12">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Results for
            </p>
            <h1 className="mt-3 max-w-[14ch] text-4xl leading-[1.05] font-medium tracking-tight sm:text-5xl lg:text-6xl">
              {query}
            </h1>
            <p className="mt-5 text-xs tracking-[0.18em] text-muted-foreground uppercase tabular-nums">
              {count} {count === 1 ? "product" : "products"}
            </p>
          </header>

          <ListingControls
            categories={categories}
            sort={sort}
            category={category}
            query={query}
          />

          {products.length === 0 ? (
            <NoProducts message={`Nothing matched “${query}”.`} />
          ) : (
            <>
              <div className={PRODUCT_GRID}>
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    config={config}
                    priority={index === 0}
                  />
                ))}
              </div>
              <ListingPagination
                basePath="/search"
                currentPage={page}
                totalPages={totalPages}
                params={{
                  q: query,
                  sort: sort === "featured" ? undefined : sort,
                  category: category || undefined,
                }}
              />
            </>
          )}
        </>
      ) : (
        <div className="border-t border-border pt-12 sm:pt-20">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Search
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl leading-[1.05] font-medium tracking-tight sm:text-6xl">
            What are you looking for?
          </h2>
          {categories.length > 0 && (
            <div className="mt-12">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Or browse
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-lg">
                {categories.map((option) => (
                  <li key={option.value}>
                    <Link
                      to={`/category/${option.value}`}
                      className="border-b border-foreground/30 pb-0.5 transition-colors hover:border-foreground"
                    >
                      {option.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
