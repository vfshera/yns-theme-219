import { Star } from "lucide-react";
import { ReviewForm } from "./ReviewForm";
import type { ProductReview } from "~/lib/mock-store/types";

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const rounded = Math.round(rating);

  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={
            size === "lg"
              ? `size-5 ${index < rounded ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`
              : `size-4 ${index < rounded ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`
          }
        />
      ))}
    </span>
  );
}

function ReviewSummary({
  summary,
}: {
  summary: { averageRating: number; reviewCount: number };
}) {
  if (summary.reviewCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating rating={summary.averageRating} size="lg" />
      <span className="text-lg font-medium">
        {summary.averageRating.toFixed(1)}
      </span>
      <span className="text-muted-foreground">
        ({summary.reviewCount}{" "}
        {summary.reviewCount === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-2 border-b border-border pb-6 last:border-0">
      <StarRating rating={review.rating} />
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{review.author}</span>
        <time dateTime={review.createdAt} className="text-muted-foreground">
          {date}
        </time>
      </div>
      <p className="text-muted-foreground leading-relaxed">{review.content}</p>
    </div>
  );
}

/** The source's review section: summary, list and a moderated submission form. */
export function ProductReviews({
  reviews,
  summary,
  slug,
}: {
  reviews: ProductReview[];
  summary: { averageRating: number; reviewCount: number };
  slug: string;
}) {
  return (
    <section
      id="reviews"
      className="mt-20 border-t border-border pt-16 scroll-mt-24"
    >
      <h2 className="text-3xl font-medium tracking-tight">Customer Reviews</h2>
      <div className="mt-4">
        <ReviewSummary summary={summary} />
      </div>
      <div className="mt-8 space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <p className="text-muted-foreground">
            No reviews yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
      <div className="mt-10">
        <ReviewForm slug={slug} />
      </div>
    </section>
  );
}
