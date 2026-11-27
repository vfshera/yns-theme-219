/**
 * Server-only seam replacing the platform's proxied `/api/chat`. Replies are canned
 * keyword matches so the widget is fully wired without an AI backend or new deps.
 */
export type ChatResult = { reply: string; error?: string };

export function chatReply(message: unknown): ChatResult {
  if (typeof message !== "string" || message.trim().length === 0) {
    return { reply: "", error: "Please enter a message." };
  }

  const text = message.toLowerCase();

  if (text.includes("ship") || text.includes("deliver")) {
    return {
      reply:
        "Free shipping is included on orders over $50. Smaller orders ship at a flat rate.",
    };
  }
  if (text.includes("return") || text.includes("refund")) {
    return {
      reply:
        "You can return unused items within 30 days. See our Returns & Refunds page for details.",
    };
  }
  if (text.includes("product") || text.includes("stationery")) {
    return {
      reply:
        "Our Pastel Stationery Set is a customer favourite — and buying three or more saves you more.",
    };
  }

  return {
    reply:
      "Thanks for reaching out! I can help with shipping, returns and product questions.",
  };
}
