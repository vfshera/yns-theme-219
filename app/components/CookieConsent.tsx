import { useEffect, useState } from "react";
import { useRouteLoaderData } from "react-router";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";

const COOKIE_NAME = "yns-cookie-consent";

/**
 * Browser-only consent bar. The template ships no trackers, so the source's
 * dataLayer bootstrap is omitted; a vendor-neutral `yns:consent` event is the
 * seam a future analytics layer can subscribe to.
 */
export function CookieConsent() {
  const data = useRouteLoaderData("root") as
    | { info?: { cookieConsent?: boolean } }
    | undefined;
  const enabled = data?.info?.cookieConsent ?? false;
  const [mounted, setMounted] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      const existing = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${COOKIE_NAME}=`));
      if (existing) {
        setChoice(existing.split("=")[1] ?? null);
      }
    });
  }, []);

  if (!enabled || !mounted || choice !== null) {
    return null;
  }

  const recordChoice = (value: "accepted" | "declined") => {
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("yns:consent", { detail: value }));
    setChoice(value);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">We use cookies</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We use cookies to improve your experience and personalise what you
            see. You can change your choice at any time.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => recordChoice("declined")}
          >
            Decline
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => recordChoice("accepted")}
          >
            Accept
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Decline cookies"
            onClick={() => recordChoice("declined")}
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
