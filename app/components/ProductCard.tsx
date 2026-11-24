import { Link } from "react-router";
import { YnsMedia } from "~/components/YnsMedia";
import { formatListingPrice } from "~/lib/format-money";
import { cn } from "~/lib/utils";
import type { TaxBehavior } from "~/lib/pricing";

export type CardProduct = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  category: { name: string } | null;
  variants: { price: string; priceGross?: string | null; images: string[] }[];
};

export type CardConfig = {
  currency: string;
  locale: string;
  taxBehavior: TaxBehavior;
};

export function ProductCard({
  product,
  config,
  priority = false,
  headingLevel = "h2",
  className,
}: {
  product: CardProduct;
  config: CardConfig;
  priority?: boolean;
  /** Heading level: "h3" under a section's h2 (home), "h2" under a page h1 (listings). */
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  const categoryName = product.category?.name ?? null;
  const priceDisplay = formatListingPrice(product.variants, config);

  const allImages = [
    ...product.images,
    ...product.variants
      .flatMap((variant) => variant.images)
      .filter((image) => !product.images.includes(image)),
  ];
  const primaryImage = allImages[0];
  const secondaryImage = allImages[1];

  // Deferred: QuickAddButton and the single-variant deep-link query string both need
  // Cart state and product variant data, so they are intentionally omitted in this pass.
  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn("group relative flex flex-col", className)}
    >
      <div className="relative mb-5 aspect-[9/10] w-full overflow-hidden bg-secondary">
        {primaryImage && (
          <YnsMedia
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-[opacity,filter] duration-500 group-hover:brightness-[.8]",
              secondaryImage && "group-hover:opacity-0",
            )}
            priority={priority}
            fetchPriority={priority ? "high" : undefined}
          />
        )}
        {secondaryImage && (
          <YnsMedia
            src={secondaryImage}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
      </div>
      {categoryName && (
        <div className="mb-3 flex items-center gap-1.5">
          <span className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            {categoryName}
          </span>
        </div>
      )}
      <Heading className="mb-1.5 text-sm font-semibold text-balance sm:text-base">
        {product.name}
      </Heading>
      <p className="text-sm font-medium text-muted-foreground sm:text-base">
        {priceDisplay}
      </p>
    </Link>
  );
}
