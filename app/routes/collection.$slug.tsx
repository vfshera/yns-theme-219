import type { Route } from "./+types/collection.$slug";
import { Link } from "react-router";
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
import { YnsMedia } from "~/components/YnsMedia";
import { plainText } from "~/lib/display";
import { PRODUCT_GRID } from "~/lib/product-grid";
import {
  getCollectionBySlug,
  getProducts,
} from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";

export function loader({ params }: Route.LoaderArgs) {
  const collection = getCollectionBySlug(params.slug);

  if (!collection) {
    throw new Response("Not Found", { status: 404 });
  }

  const products = collection.productCollections.map((item) => item.product);

  return {
    name: collection.name,
    slug: collection.slug,
    description: collection.description
      ? plainText(collection.description)
      : null,
    image: collection.image,
    products,
    suggestions: products.length === 0 ? getProducts(4) : [],
    config: getStoreConfig(),
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData.name },
  {
    tagName: "link",
    rel: "canonical",
    href: `/collection/${loaderData.slug}`,
  },
];

export default function Collection({ loaderData }: Route.ComponentProps) {
  const { name, description, image, products, suggestions, config } =
    loaderData;

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
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="mb-10 grid overflow-hidden rounded-lg bg-pastel-3 sm:grid-cols-12 lg:mb-14 lg:h-[320px]">
        <div className="flex items-center px-6 py-10 sm:col-span-7 sm:px-10 lg:pl-20">
          <div className="min-w-0">
            <h1 className="mb-3 font-display text-[2.5rem] leading-[1.05] text-balance sm:text-5xl lg:text-6xl">
              {name}
            </h1>
            {description && (
              <p className="max-w-md text-primary">{description}</p>
            )}
          </div>
        </div>
        {image && (
          <div className="packshot relative h-56 sm:col-span-5 sm:h-auto sm:min-h-64">
            <YnsMedia
              src={image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              className="object-contain object-right"
              priority
            />
          </div>
        )}
      </section>

      {products.length === 0 ? (
        <>
          <NoProducts message="Nothing in this collection just yet." />
          {suggestions.length > 0 && (
            <section aria-labelledby="collection-suggestions">
              <h2
                id="collection-suggestions"
                className="mb-6 text-2xl font-medium"
              >
                Meanwhile, in the shop
              </h2>
              <div className={PRODUCT_GRID}>
                {suggestions.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    config={config}
                    headingLevel="h3"
                  />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          <h2 className="mb-4 text-xl font-semibold">
            Products ({products.length})
          </h2>
          <div className={PRODUCT_GRID}>
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                config={config}
                headingLevel="h3"
                priority={index < 2}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
