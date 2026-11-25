import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFetcher, useFetchers } from "react-router";
import { cartReducer, getCartDisplaySubtotal } from "~/lib/cart/cart-math";
import { useCartConfig } from "./use-cart-config";
import type {
  Cart,
  CartAction,
  CartLineItem,
  CartResponse,
} from "~/lib/cart/types";

type CartContextValue = {
  cart: Cart | null;
  items: CartLineItem[];
  itemCount: number;
  subtotal: bigint;
  isOpen: boolean;
  isMutating: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Instant local change for optimistic feedback. */
  dispatch: (action: CartAction) => void;
  /** Replace local state with the server's authoritative cart. */
  syncCart: (next: Cart | null) => void;
  /** Refetch the loader after a failed write. */
  reconcile: () => void;
  /** Wrap a POST so pending state and the written guard are tracked centrally. */
  mutate: (submit: () => void) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { taxBehavior } = useCartConfig();

  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const written = useRef(false);
  const started = useRef(false);
  const forceSync = useRef(false);

  const loadFetcher = useFetcher<CartResponse>();
  const load = useCallback(() => void loadFetcher.load("/cart"), [loadFetcher]);
  const pendingFetch = useFetchers().some(
    (fetcher) => fetcher.state !== "idle" && fetcher.formData?.has("intent"),
  );

  useEffect(() => {
    // One read per full page load; soft navigations keep this provider mounted.
    if (!started.current) {
      started.current = true;
      load();
    }
  }, [load]);

  useEffect(() => {
    // A write that landed first wins; a failed load just leaves the cart empty.
    if (loadFetcher.state !== "idle" || !loadFetcher.data) {
      return;
    }

    if (forceSync.current || !written.current) {
      setCart(loadFetcher.data.cart ?? null);
      forceSync.current = false;
    }
  }, [loadFetcher.state, loadFetcher.data]);

  useEffect(() => {
    // Restore from bfcache (e.g. returning from hosted checkout) can change the cart.
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }

      written.current = true;
      forceSync.current = true;
      load();
    };

    window.addEventListener("pageshow", onPageShow);

    return () => window.removeEventListener("pageshow", onPageShow);
  }, [load]);

  const dispatch = useCallback((action: CartAction) => {
    written.current = true;
    setCart((previous) => cartReducer(previous, action));
  }, []);

  const syncCart = useCallback((next: Cart | null) => {
    if (next) {
      written.current = true;
      // A newer server cart supersedes any in-flight reconcile.
      forceSync.current = false;
      setCart(next);
    }
  }, []);

  const reconcile = useCallback(() => {
    written.current = true;
    forceSync.current = true;
    load();
  }, [load]);

  const mutate = useCallback((submit: () => void) => {
    written.current = true;
    forceSync.current = false;
    submit();
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const items = cart?.lineItems ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartDisplaySubtotal(cart, taxBehavior);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        isOpen,
        isMutating: pendingFetch,
        openCart,
        closeCart,
        dispatch,
        syncCart,
        reconcile,
        mutate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
