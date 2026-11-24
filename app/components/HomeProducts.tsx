import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "~/components/ProductCard";
import type { CardConfig, CardProduct } from "~/components/ProductCard";

const PRODUCT_GRID =
  "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5";

export function HomeProducts({
  products,
  config,
}: {
  products: CardProduct[];
  config: CardConfig;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="home-products" className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 id="home-products" className="text-2xl font-medium">
          Products
        </h2>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline hover:underline-offset-2"
        >
          View all
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
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
    </section>
  );
}
