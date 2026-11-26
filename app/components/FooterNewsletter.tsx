import { useId, useState } from "react";
import { useFetcher } from "react-router";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { NewsletterConsent } from "~/components/NewsletterConsent";

type NewsletterResponse = {
  success: boolean;
  message: string;
  email?: string;
  error?: string;
};

/** The outlined footer signup, now wired to the stub-backed /newsletter action. */
export function FooterNewsletter() {
  const inputId = useId();
  const [consent, setConsent] = useState(false);
  const fetcher = useFetcher<NewsletterResponse>();
  const data = fetcher.data;
  const pending = fetcher.state !== "idle";

  if (data?.success) {
    return (
      <p className="mb-8 flex items-center gap-2 text-primary">
        <Check aria-hidden="true" className="size-4" />
        {data.message}
      </p>
    );
  }

  return (
    <fetcher.Form method="post" action="/newsletter" className="mb-8 space-y-3">
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <Mail
          className="pointer-events-none absolute left-2.5 top-1/2 size-6 -translate-y-1/2 text-primary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="email"
          name="email"
          required
          placeholder="Enter your email"
          className="h-12 w-full rounded-md border border-primary bg-transparent px-12 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          disabled={!consent || pending}
          className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-primary transition-colors hover:bg-secondary-foreground/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <ArrowRight
              className="size-6"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
        </button>
      </div>
      <NewsletterConsent
        checked={consent}
        onCheckedChange={setConsent}
        className="text-primary"
      />
      {data?.error && (
        <p className="text-sm text-destructive" role="alert">
          {data.error}
        </p>
      )}
    </fetcher.Form>
  );
}
