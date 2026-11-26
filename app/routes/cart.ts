import type { Route } from "./+types/cart";
import {
  bundleItemResolver,
  parseSelections,
  validateSelections,
} from "~/lib/bundles/selections";
import {
  getCartCookie,
  serializeCartCookie,
} from "~/lib/cart/cart-cookie.server";
import {
  applyCoupon,
  createCart,
  getCart,
  makeBundleLine,
  removeCoupon,
  removeLine,
  upsertLine,
} from "~/lib/mock-store/cart.server";
import {
  getBundleById,
  getProductByVariantId,
} from "~/lib/mock-store/catalog.server";
import type { BundleLine, BundleSelection } from "~/lib/bundles/types";
import type { CartResponse } from "~/lib/cart/types";

const reply = (body: CartResponse, setCookie?: string) =>
  Response.json(body, {
    headers: setCookie ? { "Set-Cookie": setCookie } : undefined,
  });

const invalid = (error: string) =>
  Response.json({ cart: null, error } satisfies CartResponse, { status: 400 });

const field = (form: FormData, key: string): string | null => {
  const value = form.get(key);

  return typeof value === "string" && value.length > 0 ? value : null;
};

const quantityFrom = (
  form: FormData,
  fallback: number | null,
): number | null => {
  const raw = field(form, "quantity");
  if (raw === null) {
    return fallback;
  }

  const value = Number(raw);

  return Number.isInteger(value) && value >= 0 && value <= 99 ? value : null;
};

/** Server backstop: only active plans belonging to the variant's product may be used. */
const planError = (variantId: string, planId: string | null): string | null => {
  const product = getProductByVariantId(variantId);
  if (!product) {
    return "Product not found";
  }

  const plans = product.subscriptionPlanProducts
    .map(({ subscriptionPlan }) => subscriptionPlan)
    .filter((plan) => plan.active);

  if (planId && !plans.some((plan) => plan.id === planId)) {
    return "Invalid subscription plan";
  }

  if (product.subscriptionMode === "only" && !planId) {
    return "Choose a subscription plan";
  }

  return null;
};

/** Reads the JSON selections field for bundle line mutations, with the same backstop as adds. */
const bundleFromField = (
  variantId: string,
  raw: string | null,
):
  | { error: string }
  | { line: BundleLine; selections: BundleSelection[] }
  | null => {
  if (!raw) {
    return null;
  }

  const product = getProductByVariantId(variantId);
  if (!product?.bundle) {
    return { error: "Bundle not found" };
  }

  const selections = parseSelections(raw);
  if (!selections) {
    return { error: "Invalid bundle selection" };
  }

  const error = validateSelections(
    product.bundle,
    selections,
    bundleItemResolver(product.bundle),
  );
  if (error) {
    return { error };
  }

  const line = makeBundleLine(product, selections);

  return line ? { line, selections } : { error: "Invalid bundle selection" };
};

export async function loader({ request }: Route.LoaderArgs) {
  const id = await getCartCookie(request);

  return reply({ cart: getCart(id) });
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = field(form, "intent");
  const id = await getCartCookie(request);

  switch (intent) {
    case "add": {
      const variantId = field(form, "variantId");
      const quantity = quantityFrom(form, 1);
      const planId = field(form, "subscriptionPlanId");
      if (!variantId || quantity === null) {
        return invalid("Invalid product or quantity");
      }

      const error = planError(variantId, planId);
      if (error) {
        return invalid(error);
      }

      const existing = getCart(id);
      let cartId: string;
      let setCookie: string | undefined;

      if (existing) {
        cartId = existing.id;
      } else {
        // A stale or missing cookie must not block an add: mint a cart and send it back.
        const created = createCart();
        cartId = created.id;
        setCookie = await serializeCartCookie(cartId);
      }

      const cart = upsertLine({ id: cartId, variantId, quantity, planId });

      return cart ? reply({ cart }, setCookie) : invalid("Product not found");
    }

    case "add-bundle": {
      const bundleId = field(form, "bundleId");
      const selections = parseSelections(field(form, "selections"));
      const quantity = quantityFrom(form, 1);

      if (!bundleId || !selections || quantity === null || quantity < 1) {
        return invalid("Invalid bundle selection");
      }

      const product = getBundleById(bundleId);
      if (!product?.bundle) {
        return invalid("Bundle not found");
      }

      const error = validateSelections(
        product.bundle,
        selections,
        bundleItemResolver(product.bundle),
      );
      if (error) {
        return invalid(error);
      }

      const variantId = product.variants[0]?.id;
      const bundle = makeBundleLine(product, selections);
      if (!variantId || !bundle) {
        return invalid("Invalid bundle selection");
      }

      const existing = getCart(id);
      let cartId: string;
      let setCookie: string | undefined;

      if (existing) {
        cartId = existing.id;
      } else {
        const created = createCart();
        cartId = created.id;
        setCookie = await serializeCartCookie(cartId);
      }

      const cart = upsertLine({ id: cartId, variantId, quantity, bundle });

      return cart ? reply({ cart }, setCookie) : invalid("Bundle not found");
    }

    case "set-quantity":
    case "remove": {
      if (!id || !getCart(id)) {
        return invalid("Your cart is empty");
      }

      const variantId = field(form, "variantId");
      const planId = field(form, "subscriptionPlanId");
      if (!variantId) {
        return invalid("Invalid product");
      }

      const bundleInfo = bundleFromField(variantId, field(form, "selections"));
      if (bundleInfo && "error" in bundleInfo) {
        return invalid(bundleInfo.error);
      }

      const bundleLine = bundleInfo?.line ?? null;
      if (!bundleLine) {
        const error = planError(variantId, planId);
        if (error) {
          return invalid(error);
        }
      }

      if (intent === "remove") {
        return reply({
          cart: removeLine(id, variantId, planId, bundleInfo?.selections),
        });
      }

      const quantity = quantityFrom(form, null);
      if (quantity === null) {
        return invalid("Invalid quantity");
      }

      return reply({
        cart: upsertLine({
          id,
          variantId,
          quantity,
          mode: "set",
          planId,
          bundle: bundleLine,
        }),
      });
    }

    case "apply-coupon": {
      if (!id || !getCart(id)) {
        return invalid("Add something to your cart first");
      }

      const code = field(form, "code");
      if (!code) {
        return invalid("Enter a discount code");
      }

      const cart = applyCoupon(id, code.trim().toUpperCase());

      return cart
        ? reply({ cart })
        : invalid("This code doesn't apply to the items in your cart");
    }

    case "remove-coupon": {
      if (!id || !getCart(id)) {
        return invalid("Your cart is empty");
      }

      return reply({ cart: removeCoupon(id) });
    }

    default:
      return invalid("Unknown cart action");
  }
}
