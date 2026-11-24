import { ProductCard } from "~/components/ProductCard";
import type { CardConfig, CardProduct } from "~/components/ProductCard";

/** The source's sideways "You might also like" row, rendered only when there are suggestions. */
export function RelatedProducts({
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
    <section
      aria-labelledby="related-products"
      className="mt-20 flex flex-col gap-6 lg:mt-24"
    >
      <h2 id="related-products" className="text-2xl font-medium">
        You might also like
      </h2>
      <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:scroll-px-6 md:px-6 xl:mx-0 xl:scroll-px-0 xl:px-0">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            config={config}
            headingLevel="h3"
            className="w-[62vw] max-w-[326px] shrink-0 snap-start sm:w-[326px]"
          />
        ))}
      </div>
    </section>
  );
}
