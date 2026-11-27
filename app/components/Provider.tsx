import type { ReactNode } from "react";
import { CartProvider, CartSidebar } from "~/components/cart";
import { CookieConsent } from "~/components/CookieConsent";
import { NewsletterDialog } from "~/components/NewsletterDialog";
import { StoreChat } from "~/components/StoreChat";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";

export default function Provider({ children }: { children: ReactNode }) {
  return (
    <>
      <TooltipProvider>
        <CartProvider>
          {children}
          <CartSidebar />
          <NewsletterDialog />
          <CookieConsent />
          <StoreChat />
        </CartProvider>
      </TooltipProvider>
      <Toaster richColors position="top-center" />
    </>
  );
}
