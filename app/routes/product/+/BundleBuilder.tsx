import { useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart, useCartConfig } from "~/components/cart";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { YnsMedia } from "~/components/YnsMedia";
import { bundleSubtotal, priceTotal } from "~/lib/bundles/pricing";
import {
  bundleItemResolver,
  defaultSelections,
  validateSelections,
} from "~/lib/bundles/selections";
import { formatMoney } from "~/lib/format-money";
import { displayPrice } from "~/lib/pricing";
import { cn } from "~/lib/utils";
import type {
  Bundle,
  BundleGroup,
  BundlePricing,
  BundleSelection,
} from "~/lib/bundles/types";
import type { CartResponse } from "~/lib/cart/types";

/**
 * Group picker for products whose `type` is `bundle`. Ported from the source theme's
 * `bundle-builder.tsx`; the authoritative price comes from the `/cart` response, this
 * preview only mirrors the core's pricing modes.
 */
export function BundleBuilder({
  bundleId,
  productName,
  bundle,
  pricing,
}: {
  bundleId: string;
  productName: string;
  bundle: Bundle;
  pricing: BundlePricing;
}) {
  const { currency, locale, taxBehavior } = useCartConfig();
  const { syncCart, reconcile, mutate, openCart } = useCart();
  const fetcher = useFetcher<CartResponse>();
  const synced = useRef<CartResponse | null>(null);
  const submitting = useRef(false);

  const [selections, setSelections] = useState<BundleSelection[]>(() =>
    defaultSelections(bundle),
  );
  const resolver = useMemo(() => bundleItemResolver(bundle), [bundle]);
  const error = validateSelections(bundle, selections, resolver);

  useEffect(() => {
    submitting.current = false;

    if (!fetcher.data || synced.current === fetcher.data) {
      return;
    }

    synced.current = fetcher.data;

    if (fetcher.data.cart) {
      syncCart(fetcher.data.cart);
      openCart();
      toast.success(`${productName} added to cart`);
    } else {
      reconcile();
      toast.error(fetcher.data.error ?? "Could not add to cart");
    }
  }, [fetcher.state, fetcher.data, syncCart, reconcile, openCart, productName]);

  const quantityOf = (groupId: string, variantId: string) =>
    selections.find(
      (selection) =>
        selection.groupId === groupId && selection.variantId === variantId,
    )?.quantity ?? 0;

  const groupTotal = (group: BundleGroup) =>
    selections
      .filter((selection) => selection.groupId === group.id)
      .reduce((sum, selection) => sum + selection.quantity, 0);

  const setQuantity = (groupId: string, variantId: string, next: number) =>
    setSelections((previous) => [
      ...previous.filter(
        (selection) =>
          !(selection.groupId === groupId && selection.variantId === variantId),
      ),
      ...(next > 0 ? [{ groupId, variantId, quantity: next }] : []),
    ]);

  const pickRadio = (group: BundleGroup, variantId: string) =>
    setSelections((previous) => [
      ...previous.filter((selection) => selection.groupId !== group.id),
      { groupId: group.id, variantId, quantity: 1 },
    ]);

  const { subtotal, total } = useMemo(() => {
    const items = selections.flatMap((selection) => {
      const item = resolver(selection.variantId);

      return item ? [{ ...item, quantity: selection.quantity }] : [];
    });
    const sum = bundleSubtotal(items, taxBehavior);

    return {
      subtotal: sum,
      total: priceTotal(sum, pricing, bundle.discountPercentage, taxBehavior),
    };
  }, [selections, resolver, taxBehavior, pricing, bundle.discountPercentage]);

  const hasSavings = total < subtotal;
  const pending = fetcher.state !== "idle";

  const add = () => {
    if (error || pending || submitting.current) {
      return;
    }

    submitting.current = true;
    const form = new FormData();
    form.append("intent", "add-bundle");
    form.append("bundleId", bundleId);
    form.append("selections", JSON.stringify(selections));

    mutate(
      () => void fetcher.submit(form, { method: "post", action: "/cart" }),
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {[...bundle.groups]
        .sort((a, b) => a.position - b.position)
        .map((group) => {
          const isRadio = group.maxQuantity === 1 && !group.allowDuplicates;
          const isForced = group.items.every((item) => item.forced);
          const picked = groupTotal(group);
          const atGroupMax =
            group.maxQuantity !== null && picked >= group.maxQuantity;
          const isSwatchGroup =
            group.items.length > 1 &&
            new Set(group.items.map((item) => item.productSlug)).size === 1;

          return (
            <fieldset key={group.id} className="grid gap-3">
              <legend className="flex w-full items-baseline justify-between gap-3">
                <span className="font-semibold text-lg">
                  {group.name ?? (isForced ? "Included" : "Choose your items")}
                </span>
                {!isForced && group.maxQuantity !== null && (
                  <span className="shrink-0 text-muted-foreground text-sm">
                    Selected {picked} of {group.maxQuantity}
                  </span>
                )}
              </legend>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[...group.items]
                  .sort((a, b) => a.position - b.position)
                  .map((item) => {
                    const quantity = quantityOf(group.id, item.variantId);
                    const selected = quantity > 0;
                    const outOfStock = item.stock !== null && item.stock <= 0;
                    const itemCap =
                      item.maxQuantity ??
                      (group.allowDuplicates ? Number.POSITIVE_INFINITY : 1);
                    const canIncrement =
                      !item.forced &&
                      !outOfStock &&
                      quantity < itemCap &&
                      (item.stock === null || quantity < item.stock) &&
                      !atGroupMax;
                    const swatchColor =
                      item.options.find(
                        (option) => option.type.toLowerCase() === "color",
                      )?.colorValue ?? null;
                    const label =
                      isSwatchGroup && item.options.length > 0
                        ? item.options.map((option) => option.value).join(" / ")
                        : item.label;

                    return (
                      <div
                        key={item.variantId}
                        className={cn(
                          "relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors",
                          selected
                            ? "border-primary ring-1 ring-primary"
                            : "border-border",
                          outOfStock && "opacity-50",
                        )}
                      >
                        {selected && (
                          <span
                            aria-hidden
                            className="absolute left-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                          >
                            <Check className="size-4" />
                          </span>
                        )}

                        <button
                          type="button"
                          aria-pressed={selected}
                          disabled={
                            item.forced ||
                            outOfStock ||
                            (isRadio ? false : !selected && atGroupMax)
                          }
                          onClick={() => {
                            if (item.forced || outOfStock) {
                              return;
                            }

                            if (isRadio) {
                              pickRadio(group, item.variantId);
                            } else {
                              setQuantity(
                                group.id,
                                item.variantId,
                                selected ? 0 : 1,
                              );
                            }
                          }}
                          className="flex flex-1 flex-col gap-2 p-2 text-left disabled:cursor-not-allowed"
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                            {item.images[0] && (
                              <YnsMedia
                                src={item.images[0]}
                                alt={label}
                                fill
                                className="object-cover"
                                sizes="200px"
                              />
                            )}
                          </div>
                          <span className="flex items-center gap-1.5 font-medium text-sm">
                            {swatchColor && (
                              <span
                                aria-hidden
                                className="inline-block size-3 shrink-0 rounded-full border border-border"
                                style={{ backgroundColor: swatchColor }}
                              />
                            )}
                            <span className="line-clamp-2">{label}</span>
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {formatMoney({
                              amount:
                                displayPrice(item, taxBehavior) ?? item.price,
                              currency,
                              locale,
                            })}
                          </span>
                          {outOfStock && (
                            <span className="text-destructive text-xs">
                              Out of stock
                            </span>
                          )}
                          {item.forced && (
                            <Badge variant="secondary" className="w-fit">
                              {item.fixedQuantity > 1
                                ? `Included ×${item.fixedQuantity}`
                                : "Included"}
                            </Badge>
                          )}
                        </button>

                        {!isRadio && !item.forced && selected && (
                          <div className="flex items-center justify-between border-t px-2 py-1.5">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7"
                              aria-label={`Remove one ${label}`}
                              onClick={() =>
                                setQuantity(
                                  group.id,
                                  item.variantId,
                                  quantity - 1,
                                )
                              }
                            >
                              <Minus className="size-4" />
                            </Button>
                            <span className="min-w-6 text-center font-medium text-sm tabular-nums">
                              {quantity}
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7"
                              aria-label={`Add one ${label}`}
                              disabled={!canIncrement}
                              onClick={() =>
                                setQuantity(
                                  group.id,
                                  item.variantId,
                                  quantity + 1,
                                )
                              }
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </fieldset>
          );
        })}

      <div className="sticky bottom-0 flex flex-col gap-3 border-t bg-background/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          {hasSavings && (
            <span className="text-muted-foreground text-lg line-through">
              {formatMoney({ amount: subtotal, currency, locale })}
            </span>
          )}
          <span className="font-bold text-2xl">
            {formatMoney({ amount: total, currency, locale })}
          </span>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="button"
            size="lg"
            className="rounded-4xl"
            disabled={Boolean(error) || pending}
            onClick={add}
          >
            {pending ? "Adding…" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
