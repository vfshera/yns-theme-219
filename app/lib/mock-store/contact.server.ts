/**
 * Server-only seam replacing the source theme's `commerce.contactMessageCreate`.
 * The static mock store has no mail transport, so a valid submission is accepted
 * locally. The failure branch stays real code so the source's generic error UI
 * is still exercised; use `fail@example.com` to trigger it.
 */
export type ContactSendResult = { ok: true } | { ok: false; error: string };

export function sendContactMessage(
  email: unknown,
  message: unknown,
): ContactSendResult {
  if (!email || typeof email !== "string") {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return { ok: false, error: "Please enter a message." };
  }

  if (email.trim().toLowerCase() === "fail@example.com") {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  return { ok: true };
}
