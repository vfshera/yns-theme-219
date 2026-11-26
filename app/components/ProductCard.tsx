import { Link } from "react-router";
import { QuickAddButton } from "~/components/QuickAddButton";
import { YnsMedia } from "~/components/YnsMedia";
import { formatListingPrice } from "~/lib/format-money";
import { cn } from "~/lib/utils";
import type { TaxBehavior } from "~/lib/pricing";
import type { VariantCombination } from "~/lib/variants/types";
import type { VolumeTier } from "~/lib/volume-pricing";

export type CardVariant = {
  id: string;
  price: string;
  priceGross?: string | null;
  stock: number | null;
  images: string[];
  combinations: VariantCombination[];
};

export type CardProduct = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  category: { name: string } | null;
  type?: "product" | "bundle";
  subscriptionMode?: "optional" | "only" | "rolling";
  volumePricingTiers?: VolumeTier[] | null;
  variants: CardVariant[];
};

export type CardConfig = {
  currency: string;
  locale: string;
  taxBehavior: TaxBehavior;
};

/** Quick Add mirrors the source: one in-stock variant of a one-time-purchasable product. */
const quickAddVariant = (product: CardProduct): CardVariant | null => {
  const oneTimeAllowed =
    !product.subscriptionMode || product.subscriptionMode === "optional";
  const [variant] = product.variants;

  return oneTimeAllowed &&
    product.type !== "bundle" &&
    product.variants.length === 1 &&
    variant.stock !== 0
    ? variant
    : null;
};

/** The source's generic `?Label=Value` link, built from variant-type labels. */
export const productHref = (product: CardProduct): string => {
  const variant = quickAddVariant(product);
  const base = `/product/${product.slug}`;
  if (!variant || variant.combinations.length === 0) {
    return base;
  }

  const params = new URLSearchParams();
  for (const { variantValue } of variant.combinations) {
    params.set(variantValue.variantType.label, variantValue.value);
  }

  const query = params.toString();

  return query ? `${base}?${query}` : base;
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
  const variant = quickAddVariant(product);

  const allImages = [
    ...product.images,
    ...product.variants
      .flatMap((item) => item.images)
      .filter((image) => !product.images.includes(image)),
  ];
  const primaryImage = allImages[0];
  const secondaryImage = allImages[1];

  return (
    <Link
      to={productHref(product)}
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
        {variant && (
          <QuickAddButton
            variantId={variant.id}
            variantPrice={variant.price}
            variantPriceGross={variant.priceGross ?? variant.price}
            variantImages={variant.images}
            variantCombinations={variant.combinations}
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              images: product.images,
              volumePricingTiers: product.volumePricingTiers ?? null,
            }}
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
