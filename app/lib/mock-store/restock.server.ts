import { getProductByVariantId } from "./catalog.server";

/**
 * Server-only seam replacing the source's `/availability-notifications` call.
 * Marketing consent is optional here — the alert is not a newsletter subscription.
 * `fail@example.com` exercises the generic failure branch.
 */
export type RestockResult = {
  success: boolean;
  message: string;
  error?: string;
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function requestRestock(
  variantId: unknown,
  email: unknown,
  marketingConsent: unknown,
): RestockResult {
  if (typeof variantId !== "string" || variantId.length === 0) {
    return { success: false, message: "", error: "Invalid product" };
  }

  const product = getProductByVariantId(variantId);
  const variant = product?.variants.find((entry) => entry.id === variantId);
  if (!variant || variant.stock !== 0) {
    return {
      success: false,
      message: "",
      error: "This item is not out of stock",
    };
  }

  if (typeof email !== "string" || !EMAIL.test(email.trim())) {
    return {
      success: false,
      message: "",
      error: "Please enter a valid email address.",
    };
  }

  if (email.trim().toLowerCase() === "fail@example.com") {
    return {
      success: false,
      message: "",
      error: "Something went wrong. Please try again.",
    };
  }

  // Consent is recorded by the caller when present; it is not required for an alert.
  void marketingConsent;

  return {
    success: true,
    message: "Done! We'll email you when this item is back in stock.",
  };
}
