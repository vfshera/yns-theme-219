import type { Route } from "./+types/products";
import { ListingControls } from "~/components/ListingControls";
import { ListingPagination } from "~/components/ListingPagination";
import { NoProducts } from "~/components/NoProducts";
import { ProductCard } from "~/components/ProductCard";
import { parseSort } from "~/lib/catalog-sort";
import { PRODUCT_GRID } from "~/lib/product-grid";
import {
  browseCatalogProducts,
  getCategoryOptions,
  parsePage,
} from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";

export function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const page = parsePage(params.get("page"));
  const sort = parseSort(params.get("sort"));
  const category = params.get("category") ?? "";

  return {
    ...browseCatalogProducts({ page, sort, category: category || undefined }),
    sort,
    category,
    categories: getCategoryOptions(),
    config: getStoreConfig(),
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, location }) => {
  const { storeName, storeDescription } = matches[0].loaderData.info;
  const origin = matches[0].loaderData.origin;
  const description =
    storeDescription ??
    "Considered things for everyday living, in soft colours and simple shapes.";
  const url = `${origin}${location.pathname}${
    loaderData.page > 1 ? `?page=${loaderData.page}` : ""
  }`;
  const title =
    loaderData.page > 1
      ? `All Products — Page ${loaderData.page}`
      : "All Products";
  const image = loaderData.products[0]?.images[0];
  const ogImage = image ? `${origin}${image}` : undefined;

  return [
    { title: `${title} | ${storeName}` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: `${title} | ${storeName}` },
    { property: "og:description", content: description },
    ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
    {
      name: "twitter:card",
      content: ogImage ? "summary_large_image" : "summary",
    },
    { name: "twitter:title", content: `${title} | ${storeName}` },
    { name: "twitter:description", content: description },
    ...(ogImage ? [{ name: "twitter:image", content: ogImage }] : []),
  ];
};

export default function Products({ loaderData }: Route.ComponentProps) {
  const {
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
    <div className="layout min-h-svh pt-8 pb-24">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-semibold">Products ({count})</h1>
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      </header>

      <ListingControls
        categories={categories}
        sort={sort}
        category={category}
      />

      {products.length === 0 ? (
        <NoProducts />
      ) : (
        <>
          <div className={PRODUCT_GRID}>
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                config={config}
                priority={index < 2}
              />
            ))}
          </div>
          <ListingPagination
            basePath="/products"
            currentPage={page}
            totalPages={totalPages}
            params={{
              sort: sort === "featured" ? undefined : sort,
              category: category || undefined,
            }}
          />
        </>
      )}
    </div>
  );
}
