import type { VariantWithOptions } from "./types";

/**
 * Resolve `?<variantType.label>=<value>` params to a concrete variant. With no params —
 * or no variant matching them — fall back to the first (merchant-ordered) variant, so a
 * product page has a default without rewriting the URL. Partial links resolve to the
 * variant matching the most labels.
 */
export function resolveSelectedVariant<T extends VariantWithOptions>(
  variants: readonly T[],
  params: URLSearchParams,
): T | undefined {
  const fallback = variants[0];
  if (!fallback) {
    return undefined;
  }

  if (variants.length === 1 || params.size === 0) {
    return fallback;
  }

  const score = (variant: T) => {
    let matched = 0;
    for (const { variantValue } of variant.combinations) {
      const param = params.get(variantValue.variantType.label);
      if (param === null) {
        continue;
      }
      if (param !== variantValue.value) {
        return 0;
      }

      matched += 1;
    }

    return matched;
  };

  const ranked = variants
    .map((variant) => ({ variant, score: score(variant) }))
    .filter(({ score: value }) => value > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.variant ?? fallback;
}

/** Option ids of the resolved variant, used to show the default as selected on a clean URL. */
export function selectedOptionIds(
  variant: VariantWithOptions | undefined,
): Record<string, string> {
  if (!variant) {
    return {};
  }

  return Object.fromEntries(
    variant.combinations.map(({ variantValue }) => [
      variantValue.variantType.label,
      variantValue.id,
    ]),
  );
}
