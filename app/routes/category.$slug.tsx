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

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData.label },
  {
    tagName: "link",
    rel: "canonical",
    href: `/category/${loaderData.slug}`,
  },
];

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
