import { ProductCard, type CardConfig } from "~/components/ProductCard";

type EmbedProduct = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  category: { name: string } | null;
  variants: {
    id: string;
    price: string;
    priceGross?: string | null;
    images: string[];
  }[];
};

const featuredVariantOnly = (
  product: EmbedProduct,
  variantId: string | undefined,
): EmbedProduct => {
  const variant = variantId
    ? product.variants.find((item) => item.id === variantId)
    : undefined;

  return variant ? { ...product, variants: [variant] } : product;
};

/** Renders the editor's product-embed node from products resolved by the route loader. */
export function BlogProductEmbed({
  productIds,
  variantIds,
  products,
  config,
}: {
  productIds: string[];
  variantIds: Record<string, string>;
  products: EmbedProduct[];
  config: CardConfig;
}) {
  const selected = productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is EmbedProduct => Boolean(product))
    .map((product) => featuredVariantOnly(product, variantIds[product.id]));

  if (selected.length === 0) {
    return null;
  }

  return (
    <div className="not-prose clear-both my-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {selected.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          config={config}
          headingLevel="h3"
        />
      ))}
    </div>
  );
}
