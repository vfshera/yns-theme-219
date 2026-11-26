import { useEffect, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { NewsletterConsent } from "~/components/NewsletterConsent";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

type PopupSettings = {
  delaySeconds?: number;
  heading?: string;
  subheading?: string;
  ctaText?: string;
  teaserText?: string;
  discountCode?: string;
};

type NewsletterResponse = {
  success: boolean;
  message: string;
  email?: string;
  error?: string;
};

const DISMISSED_KEY = "yns-newsletter-popup-dismissed";

/** Exit-intent / delayed popup with CTA → form → success steps and a docked teaser. */
export function NewsletterDialog() {
  const data = useRouteLoaderData("root") as
    | {
        info?: {
          newsletterPopup?: boolean;
          newsletterPopupSettings?: PopupSettings | null;
        };
      }
    | undefined;
  const enabled = data?.info?.newsletterPopup ?? false;
  const settings = data?.info?.newsletterPopupSettings ?? null;

  const [state, setState] = useState<"idle" | "open" | "dismissed">("idle");
  const [step, setStep] = useState<"cta" | "form" | "success">("cta");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const fetcher = useFetcher<NewsletterResponse>();
  const pending = fetcher.state !== "idle";

  useEffect(() => {
    if (!enabled || window.localStorage.getItem(DISMISSED_KEY) === "true") {
      if (enabled) {
        queueMicrotask(() => setState("dismissed"));
      }

      return;
    }

    const open = () =>
      setState((current) => (current === "idle" ? "open" : current));
    const timer = window.setTimeout(
      open,
      (settings?.delaySeconds ?? 30) * 1000,
    );
    const onExit = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        open();
      }
    };

    document.addEventListener("mouseleave", onExit);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", onExit);
    };
  }, [enabled, settings?.delaySeconds]);

  useEffect(() => {
    const result = fetcher.data;
    if (!result) {
      return;
    }
    if (result.success) {
      window.localStorage.setItem(DISMISSED_KEY, "true");
      queueMicrotask(() => setStep("success"));
    } else {
      toast.error(result.error ?? "Failed to subscribe");
    }
  }, [fetcher.data]);

  if (!enabled) {
    return null;
  }

  const reset = () => {
    setStep("cta");
    setEmail("");
    setConsent(false);
  };
  const dismiss = () => {
    setState("dismissed");
    window.localStorage.setItem(DISMISSED_KEY, "true");
    reset();
  };

  return (
    <>
      <Dialog
        open={state === "open"}
        onOpenChange={(open) => {
          if (!open) {
            if (step === "success") {
              setState("idle");
            } else {
              dismiss();
            }
          }
        }}
      >
        <DialogContent className="gap-0 overflow-hidden border-0 p-0 sm:max-w-md">
          <DialogTitle className="sr-only">Newsletter</DialogTitle>
          <DialogDescription className="sr-only">
            Subscribe to hear from the store.
          </DialogDescription>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            {step === "cta" ? (
              <>
                <h2 className="font-display text-3xl">
                  {settings?.heading ?? "Unlock 20% Off"}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {settings?.subheading ??
                    "Subscribe to our newsletter and get an exclusive discount on your first order."}
                </p>
                <Button
                  type="button"
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => setStep("form")}
                >
                  {settings?.ctaText ?? "Get My Discount"}
                </Button>
              </>
            ) : step === "success" ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="font-display text-2xl">You&apos;re in!</h2>
                <p className="text-sm text-muted-foreground">
                  {fetcher.data?.message ?? "Thanks for subscribing!"}
                </p>
                {settings?.discountCode && (
                  <p className="rounded-md bg-muted px-4 py-2 font-mono text-lg font-semibold">
                    {settings.discountCode}
                  </p>
                )}
              </div>
            ) : (
              <fetcher.Form
                method="post"
                action="/newsletter"
                className="flex flex-col gap-4"
              >
                <h2 className="font-display text-2xl">
                  {settings?.heading ?? "Unlock 20% Off"}
                </h2>
                <label htmlFor="newsletter-popup-email" className="sr-only">
                  Email address
                </label>
                <Input
                  id="newsletter-popup-email"
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="text-center"
                />
                <NewsletterConsent
                  checked={consent}
                  onCheckedChange={setConsent}
                />
                {fetcher.data?.error && (
                  <p className="text-sm text-destructive" role="alert">
                    {fetcher.data.error}
                  </p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!email || !consent || pending}
                >
                  {pending && (
                    <Loader2
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                  )}
                  Subscribe
                </Button>
              </fetcher.Form>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {state === "dismissed" && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-primary py-2.5 pl-4 pr-2.5 text-sm font-medium text-primary-foreground shadow-lg">
          <button
            type="button"
            onClick={() => {
              reset();
              setState("open");
            }}
          >
            {settings?.teaserText ?? "Unlock 20% Off"}
          </button>
          <button
            type="button"
            aria-label="Dismiss newsletter offer"
            onClick={dismiss}
            className="flex size-6 items-center justify-center rounded-full hover:bg-primary-foreground/20"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
