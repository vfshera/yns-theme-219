import type { Route } from "./+types/cart";
import {
  getCartCookie,
  serializeCartCookie,
} from "~/lib/cart/cart-cookie.server";
import {
  applyCoupon,
  createCart,
  getCart,
  removeCoupon,
  removeLine,
  upsertLine,
} from "~/lib/mock-store/cart.server";
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
      if (!variantId || quantity === null) {
        return invalid("Invalid product or quantity");
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

      const cart = upsertLine({ id: cartId, variantId, quantity });

      return cart ? reply({ cart }, setCookie) : invalid("Product not found");
    }

    case "set-quantity":
    case "remove": {
      if (!id || !getCart(id)) {
        return invalid("Your cart is empty");
      }

      const variantId = field(form, "variantId");
      if (!variantId) {
        return invalid("Invalid product");
      }

      if (intent === "remove") {
        return reply({ cart: removeLine(id, variantId) });
      }

      const quantity = quantityFrom(form, null);
      if (quantity === null) {
        return invalid("Invalid quantity");
      }

      return reply({
        cart: upsertLine({ id, variantId, quantity, mode: "set" }),
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
