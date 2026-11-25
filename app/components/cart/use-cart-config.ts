import { useRouteLoaderData } from "react-router";
import type { TaxBehavior } from "~/lib/pricing";

export type CartConfig = {
  currency: string;
  locale: string;
  language: string | null;
  taxBehavior: TaxBehavior;
};

const FALLBACK: CartConfig = {
  currency: "USD",
  locale: "en-US",
  language: null,
  taxBehavior: "inclusive",
};

/** Read store config from the root loader; error-boundary renders fall back safely. */
export function useCartConfig(): CartConfig {
  const data = useRouteLoaderData("root") as
    | { config?: Partial<CartConfig> }
    | undefined;
  const config = data?.config;

  return {
    currency: config?.currency || FALLBACK.currency,
    locale: config?.locale || FALLBACK.locale,
    language: config?.language ?? null,
    taxBehavior: config?.taxBehavior ?? FALLBACK.taxBehavior,
  };
}
