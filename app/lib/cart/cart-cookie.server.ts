import { createCookie } from "react-router";

const cartCookie = createCookie("yns_cart", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
});

/** Extract a cart id from a parsed cookie value, tolerating anything else. */
export function parseCartCookie(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("id" in value)) {
    return null;
  }

  const { id } = value as { id?: unknown };

  return typeof id === "string" && id.length > 0 ? id : null;
}

/** Read the cart id from the request's Cookie header. Server-only. */
export async function getCartCookie(request: Request): Promise<string | null> {
  return parseCartCookie(await cartCookie.parse(request.headers.get("Cookie")));
}

/** Produce the Set-Cookie header value for a cart id. Server-only. */
export function serializeCartCookie(id: string): Promise<string> {
  return cartCookie.serialize({ id });
}

/** Expire the cart cookie after a mock order is placed. */
export function expireCartCookie(): Promise<string> {
  return cartCookie.serialize(null, { maxAge: 0 });
}
