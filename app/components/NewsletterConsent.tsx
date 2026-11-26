import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";

/**
 * Shared marketing opt-in for the newsletter footer/popup and the restock dialog.
 * The literal field name is duplicated on both sides on purpose: a constant exported
 * from a client module would arrive as a client reference inside a server action.
 * Submit stays enabled here — callers decide whether consent is required.
 */
export function NewsletterConsent({
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('[data-slot="checkbox"]')) {
          return;
        }

        onCheckedChange(!checked);
      }}
      className={cn(
        "flex cursor-pointer items-start gap-2 text-left font-normal",
        className,
      )}
    >
      <Checkbox
        name="marketingConsent"
        aria-label="I agree to receive marketing emails"
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        disabled={disabled}
        className="mt-0.5 shrink-0"
      />
      <span className="text-sm leading-snug opacity-80">
        I agree to receive marketing emails and accept the privacy policy. You
        can unsubscribe at any time.
      </span>
    </div>
  );
}
