/**
 * Server-only seam replacing the source's moderated `productReviewCreate` call.
 * A valid submission is accepted but not published — the success message says so.
 * `fail@example.com` exercises the generic failure branch.
 */
export type ReviewResult = {
  success: boolean;
  message: string;
  error?: string;
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function submitReview(form: FormData): ReviewResult {
  const slug = form.get("slug");
  const author = form.get("author");
  const email = form.get("email");
  const content = form.get("content");
  const rating = Number(form.get("rating"));

  if (
    typeof slug !== "string" ||
    slug.length === 0 ||
    typeof author !== "string" ||
    author.trim().length === 0 ||
    typeof email !== "string" ||
    !EMAIL.test(email.trim()) ||
    typeof content !== "string" ||
    content.trim().length === 0 ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return {
      success: false,
      message: "",
      error: "Please complete every field and choose a rating.",
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
    message: "Thanks for your review! It will appear once approved.",
  };
}
