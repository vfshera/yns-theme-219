import { useSearchParams } from "react-router";
import {
  resolveSelectedVariant,
  selectedOptionIds,
} from "~/lib/variants/selected";
import type { VariantWithOptions } from "~/lib/variants/types";

/** URL-driven selection for the product page; the URL is only written by the selector. */
export function useSelectedVariant<T extends VariantWithOptions>(
  variants: readonly T[],
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVariant = resolveSelectedVariant(variants, searchParams);

  return {
    selectedVariant,
    selectedOptions: selectedOptionIds(selectedVariant),
    searchParams,
    setSearchParams,
  };
}
