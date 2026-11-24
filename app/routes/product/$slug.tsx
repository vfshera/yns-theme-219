import type { Route } from "./+types/$slug";
import { isRouteErrorResponse, Link } from "react-router";
import { ChevronDown } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { formatListingPrice } from "~/lib/format-money";
import {
  getProductBySlug,
  getRelatedProducts,
} from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";
import { ProductGallery } from "./+/ProductGallery";
import { RelatedProducts } from "./+/RelatedProducts";

export function loader({ params }: Route.LoaderArgs) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    product,
    config: getStoreConfig(),
    related: getRelatedProducts(product.id, product.category?.slug),
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const product = loaderData?.product;

  return [
    { title: product?.name ?? "Product Not Found" },
    ...(product
      ? [
          {
            tagName: "link" as const,
            rel: "canonical",
            href: `/product/${product.slug}`,
          },
        ]
      : []),
  ];
};

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="layout flex min-h-svh flex-col items-start justify-center py-24">
        <h1 className="font-display text-4xl">Product not found</h1>
        <p className="mt-2 text-muted-foreground">
          This product isn&apos;t in the shop.
        </p>
        <Link
          to="/products"
          className="mt-6 text-sm font-medium text-primary underline underline-offset-4"
        >
          Back to products
        </Link>
      </main>
    );
  }

  return (
    <main className="layout py-24">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        Please try again in a moment.
      </p>
    </main>
  );
}

export default function Product({ loaderData }: Route.ComponentProps) {
  const { product, config, related } = loaderData;
  const price = formatListingPrice(product.variants, config);
  const category = product.category;
  const categoryName = category
    ? category.name.split(">").at(-1)?.trim() || category.name
    : null;

  return (
    <div className="layout min-h-svh pt-6 pb-24">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/products" />}>
              Products
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-20 flex flex-col gap-8 lg:mb-24 lg:flex-row lg:items-start lg:gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex w-full flex-col lg:w-[420px] lg:shrink-0 xl:w-[500px]">
          {category && categoryName && (
            <div className="mb-2.5 flex items-center gap-3">
              <Link
                to={`/category/${category.slug}`}
                className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-secondary-foreground/10"
              >
                {categoryName}
              </Link>
            </div>
          )}
          <h1 className="mb-3.5 text-2xl font-bold text-balance">
            {product.name}
          </h1>
          {price && <p className="text-lg font-medium">{price}</p>}

          {/* Deferred (Phase 7): AddToCartButton / VariantSelector need cart state. */}

          {(product.summary || product.content) && (
            <details open className="group mt-6 border-b border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                <h2 className="text-base font-medium">Description</h2>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="prose prose-sm max-w-none pb-5 text-primary prose-p:text-primary">
                {product.summary && (
                  <p className="whitespace-pre-line">{product.summary}</p>
                )}
                {product.content && <p>{product.content}</p>}
              </div>
            </details>
          )}
        </div>
      </div>

      <RelatedProducts products={related} config={config} />
    </div>
  );
}
