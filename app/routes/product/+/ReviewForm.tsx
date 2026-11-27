import { useState } from "react";
import { useFetcher } from "react-router";
import { Loader2, Star } from "lucide-react";
import { cn } from "~/lib/utils";

type ReviewResponse = { success: boolean; message: string; error?: string };

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;

        return (
          <button
            key={star}
            type="button"
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
            aria-pressed={value === star}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "size-6",
                star <= shown
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Moderated submission: success replaces the form; the list does not change. */
export function ReviewForm({ slug }: { slug: string }) {
  const [rating, setRating] = useState(0);
  const fetcher = useFetcher<ReviewResponse>();
  const result = fetcher.data;
  const pending = fetcher.state !== "idle";

  if (result?.success) {
    return (
      <div className="rounded-lg border border-border bg-secondary/50 p-6 text-center text-sm">
        {result.message}
      </div>
    );
  }

  return (
    <fetcher.Form
      method="post"
      action="/reviews"
      className="space-y-4 rounded-lg border border-border p-6"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={String(rating)} />
      <div>
        <p className="mb-2 text-sm font-medium">Your rating</p>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="review-author" className="text-sm font-medium">
            Name
          </label>
          <input
            id="review-author"
            name="author"
            required
            placeholder="Your name"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="review-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="review-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="review-content" className="text-sm font-medium">
          Your review
        </label>
        <textarea
          id="review-content"
          name="content"
          rows={4}
          required
          placeholder="Share your experience with this product..."
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      {result?.error && (
        <p className="text-sm text-red-600" role="alert">
          {result.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || rating === 0}
        className="rounded-md bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending && (
          <Loader2
            aria-hidden="true"
            className="mr-2 inline size-4 animate-spin"
          />
        )}
        {pending ? "Submitting..." : "Submit Review"}
      </button>
    </fetcher.Form>
  );
}
