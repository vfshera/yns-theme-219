import type { Route } from "./+types/category.$slug";
import { Link } from "react-router";
import { ListingControls } from "~/components/ListingControls";
import { ListingPagination } from "~/components/ListingPagination";
import { NoProducts } from "~/components/NoProducts";
import { ProductCard } from "~/components/ProductCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { parseSort } from "~/lib/catalog-sort";
import { PRODUCT_GRID } from "~/lib/product-grid";
import {
  browseCatalogProducts,
  getCategoryBySlug,
  getCategoryOptions,
  parsePage,
} from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";

export function loader({ params, request }: Route.LoaderArgs) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }

  const search = new URL(request.url).searchParams;
  const page = parsePage(search.get("page"));
  const sort = parseSort(search.get("sort"));
  const label = category.name.split(">").at(-1)?.trim() || category.name;

  return {
    label,
    slug: category.slug,
    ...browseCatalogProducts({ page, sort, category: category.slug }),
    sort,
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
  const title = `${loaderData.label} | ${storeName}`;
  const image = loaderData.products[0]?.images[0];
  const ogImage = image ? `${origin}${image}` : undefined;

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
    {
      name: "twitter:card",
      content: ogImage ? "summary_large_image" : "summary",
    },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(ogImage ? [{ name: "twitter:image", content: ogImage }] : []),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: loaderData.label,
        url,
        description,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${origin}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: loaderData.label,
              item: url,
            },
          ],
        },
      },
    },
  ];
};

export default function Category({ loaderData }: Route.ComponentProps) {
  const {
    label,
    slug,
    products,
    count,
    page,
    totalPages,
    sort,
    categories,
    config,
  } = loaderData;

  return (
    <div className="layout min-h-svh pt-6 pb-24">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-4 font-display text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-6xl">
        {label}
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {count} {count === 1 ? "product" : "products"}
      </p>

      <ListingControls
        categories={categories}
        sort={sort}
        showCategory={false}
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
            basePath={`/category/${slug}`}
            currentPage={page}
            totalPages={totalPages}
            params={{ sort: sort === "featured" ? undefined : sort }}
          />
        </>
      )}
    </div>
  );
}
