import type { ReactNode } from "react";
import { CartProvider, CartSidebar } from "~/components/cart";
import { NewsletterDialog } from "~/components/NewsletterDialog";
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
        </CartProvider>
      </TooltipProvider>
      <Toaster richColors position="top-center" />
    </>
  );
}
