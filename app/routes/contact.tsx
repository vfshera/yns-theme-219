import type { Route } from "./+types/contact";
import { useId } from "react";
import { data, Link, useFetcher } from "react-router";
import { ArrowRight, Check } from "lucide-react";
import { getStoreInfo } from "~/lib/mock-store/catalog.server";
import { sendContactMessage } from "~/lib/mock-store/contact.server";

export function loader() {
  const info = getStoreInfo();
  if (!info.contact) {
    throw data(null, { status: 404 });
  }

  return { info };
}

export async function action({ request }: Route.ActionArgs) {
  if (!getStoreInfo().contact) {
    throw data(null, { status: 404 });
  }

  const formData = await request.formData();
  const result = sendContactMessage(
    formData.get("email"),
    formData.get("message"),
  );

  if (!result.ok) {
    return { success: false, message: "", error: result.error };
  }

  return {
    success: true,
    message: "Thanks for reaching out! We'll get back to you soon.",
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, location }) => {
  const storeName = loaderData?.info.storeName ?? "Your Next Store";
  const description = `Get in touch with the ${storeName} team. Questions about orders, products, or anything else — we're here to help.`;
  const origin = matches[0]?.loaderData?.origin ?? "http://localhost:5173";
  const url = `${origin}${location.pathname}`;
  const title = `Contact Us | ${storeName}`;

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export default function Contact() {
  const fetcher = useFetcher<typeof action>();
  const emailId = useId();
  const messageId = useId();
  const errorId = useId();
  const pending = fetcher.state !== "idle";
  const result = fetcher.data;
  const error =
    fetcher.state === "idle" && result && !result.success
      ? result.error
      : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-10">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span>Contact Us</span>
        </nav>
        <h1 className="mt-4 text-4xl font-medium tracking-tight">Contact Us</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Have a question or just want to say hello? Send us a message and we'll
          get back to you as soon as we can.
        </p>
      </div>

      {result?.success ? (
        <div
          role="status"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-lg border border-border bg-secondary/30 p-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5">
            <Check className="size-6" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-medium tracking-tight">Message sent</h2>
          <p className="mt-2 text-muted-foreground">{result.message}</p>
        </div>
      ) : (
        <fetcher.Form method="post" className="space-y-4">
          <div>
            <label
              htmlFor={emailId}
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id={emailId}
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
            />
          </div>
          <div>
            <label
              htmlFor={messageId}
              className="block text-sm font-medium text-foreground"
            >
              Message
            </label>
            <textarea
              id={messageId}
              name="message"
              placeholder="How can we help?"
              required
              rows={6}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 font-medium text-background transition-all hover:bg-foreground/90 disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send message"}
            {!pending && (
              <ArrowRight
                className="size-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            )}
          </button>
          {error && (
            <p id={errorId} role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </fetcher.Form>
      )}

      <p className="mt-10 text-sm text-muted-foreground">
        Looking for a quick answer? Check our{" "}
        <Link to="/faq" className="font-medium text-foreground hover:underline">
          frequently asked questions
        </Link>
        .
      </p>
    </div>
  );
}
