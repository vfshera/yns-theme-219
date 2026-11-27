import { useId, useState } from "react";
import { useFetcher } from "react-router";
import { BellRing, Loader2 } from "lucide-react";
import { NewsletterConsent } from "~/components/NewsletterConsent";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type RestockResponse = { success: boolean; message: string; error?: string };

/** Replaces the purchase controls for a sold-out variant when the tool is enabled. */
export function RestockNotify({
  variantId,
  productName,
}: {
  variantId: string;
  productName: string;
}) {
  const emailId = useId();
  const [consent, setConsent] = useState(false);
  const fetcher = useFetcher<RestockResponse>();
  const result = fetcher.data;
  const pending = fetcher.state !== "idle";

  return (
    <Dialog>
      <DialogTrigger className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-input bg-background text-base font-medium tracking-wide transition-colors hover:bg-muted">
        <BellRing aria-hidden="true" className="size-5" strokeWidth={1.5} />
        Remind me when back in stock
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get a restock alert</DialogTitle>
          <DialogDescription>
            We&apos;ll email you as soon as {productName} is back in stock.
          </DialogDescription>
        </DialogHeader>
        {result?.success ? (
          <p className="rounded-md bg-secondary/50 p-4 text-sm font-medium">
            {result.message}
          </p>
        ) : (
          <fetcher.Form method="post" action="/restock" className="space-y-4">
            <input type="hidden" name="productVariantId" value={variantId} />
            <div className="space-y-1.5">
              <Label htmlFor={emailId}>Email</Label>
              <Input
                id={emailId}
                name="email"
                type="email"
                required
                placeholder="your@email.com"
              />
            </div>
            <NewsletterConsent checked={consent} onCheckedChange={setConsent} />
            {result?.error && (
              <p className="text-sm text-destructive" role="alert">
                {result.error}
              </p>
            )}
            <Button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-full"
            >
              {pending && (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              )}
              {pending ? "Submitting..." : "Notify me"}
            </Button>
          </fetcher.Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
