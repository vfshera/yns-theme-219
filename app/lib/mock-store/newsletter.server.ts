/**
 * Server-only seam replacing the source's `commerce.subscriberCreate`. It keeps the
 * real validation and failure branch; `fail@example.com` exercises the generic error.
 */
export type NewsletterResult = {
  success: boolean;
  message: string;
  email?: string;
  error?: string;
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function subscribeToNewsletter(
  email: unknown,
  marketingConsent: unknown,
): NewsletterResult {
  if (typeof email !== "string" || !EMAIL.test(email.trim())) {
    return {
      success: false,
      message: "",
      error: "Please enter a valid email address.",
    };
  }

  if (marketingConsent !== "on") {
    return {
      success: false,
      message: "",
      error: "Please accept marketing permissions to subscribe.",
    };
  }

  if (email.trim().toLowerCase() === "fail@example.com") {
    return {
      success: false,
      message: "",
      error: "Something went wrong. Please try again.",
    };
  }

  return {
    success: true,
    message: "Thanks for subscribing!",
    email: email.trim(),
  };
}
