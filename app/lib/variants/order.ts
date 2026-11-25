import type { VariantWithOptions } from "./types";

const UNPOSITIONED = Number.MAX_SAFE_INTEGER;

/**
 * Variants in merchant option order (Colour before Size, then each option's position).
 * The default variant, swatch order and gallery image all follow this order.
 */
export function sortVariantsByOptions<V extends VariantWithOptions>(
  variants: readonly V[],
): V[] {
  const positions = (variant: V) =>
    variant.combinations.map(
      ({ variantValue }) => variantValue.position ?? UNPOSITIONED,
    );

  return [...variants].sort((a, b) => {
    const aPositions = positions(a);
    const bPositions = positions(b);
    const index = aPositions.findIndex(
      (position, i) => position !== bPositions[i],
    );

    return index === -1
      ? 0
      : (aPositions[index] ?? UNPOSITIONED) -
          (bPositions[index] ?? UNPOSITIONED);
  });
}
