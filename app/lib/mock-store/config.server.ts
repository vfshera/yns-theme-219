import { queryStore } from "./handlers.server";
import type { MeResponse } from "./types";
import type { TaxBehavior } from "~/lib/pricing";

export type StoreConfig = {
  currency: string;
  locale: string;
  language: string | null;
  taxBehavior: TaxBehavior;
};

/** The store's currency/locale/tax behaviour with static fallbacks. Server-only. */
export function getStoreConfig(): StoreConfig {
  const { store } = queryStore("me") as MeResponse;
  const language = store.settings.defaultLanguage ?? null;

  return {
    currency: store.currency || "USD",
    // The storefront's default language is what shoppers read here; `store.locale` is the
    // Merchant's admin language is only a last resort.
    locale: language || store.locale || "en-US",
    language,
    taxBehavior: (store.taxBehavior || "inclusive") as TaxBehavior,
  };
}
