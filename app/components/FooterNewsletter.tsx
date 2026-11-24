import { useId } from "react";
import { Form } from "react-router";
import { ArrowRight, Mail } from "lucide-react";

/** The original's outlined footer signup field. The newsletter action is deferred. */
export function FooterNewsletter() {
  const inputId = useId();

  return (
    <Form
      method="post"
      className="mb-8 space-y-3"
      onSubmit={(event) => {
        // No action is wired up yet; keep the field inert until the newsletter route lands.
        event.preventDefault();
      }}
    >
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
          className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-primary transition-colors hover:bg-secondary-foreground/10"
        >
          <ArrowRight className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </Form>
  );
}
