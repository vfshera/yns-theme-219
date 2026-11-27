import type { Route } from "./+types/order.success.$id";
import { isRouteErrorResponse, Link } from "react-router";
import { CheckCircle } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import { YnsMedia } from "~/components/YnsMedia";
import { formatMoney } from "~/lib/format-money";
import { displayPrice } from "~/lib/pricing";
import { cn } from "~/lib/utils";
import { getOrderById } from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";

export function loader({ params }: Route.LoaderArgs) {
  const order = getOrderById(params.id);
  if (!order) {
    throw new Response("Not Found", { status: 404 });
  }

  return { order, config: getStoreConfig() };
}

export const meta: Route.MetaFunction = ({ matches, location }) => {
  const { storeName, storeDescription } = matches[0].loaderData.info;
  const origin = matches[0].loaderData.origin;
  const url = `${origin}${location.pathname}`;
  const title = `Order Confirmed | ${storeName}`;
  const description = storeDescription ?? "Your order has been confirmed.";

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { name: "robots", content: "noindex, nofollow" },
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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="layout flex min-h-svh flex-col items-start justify-center py-24">
      <h1 className="font-display text-4xl">
        {notFound ? "Order not found" : "We couldn't load your order"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        If you completed checkout, your payment still went through. Please check
        your email for the confirmation.
      </p>
      <Link to="/" className={cn(buttonVariants(), "mt-6")}>
        Continue shopping
      </Link>
    </main>
  );
}

export default function OrderSuccess({ loaderData }: Route.ComponentProps) {
  const { order, config } = loaderData;
  const money = (amount: string | number | bigint) =>
    formatMoney({ amount, currency: config.currency, locale: config.locale });
  const unitPrice = (item: (typeof order.lineItems)[number]) =>
    displayPrice(item.productVariant, config.taxBehavior) ??
    item.productVariant.price;

  return (
    <main className="layout min-h-svh py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 flex flex-col items-start gap-4">
          <CheckCircle aria-hidden="true" className="size-12 text-green-600" />
          <h1 className="font-display text-4xl">Thank you for your order!</h1>
          <p className="text-muted-foreground">
            Order #{order.lookup} has been confirmed.
          </p>
          {order.customerEmail && (
            <p className="text-sm text-muted-foreground">
              A confirmation email will be sent to {order.customerEmail}
            </p>
          )}
        </div>

        <section aria-labelledby="order-items" className="mb-12">
          <h2 id="order-items" className="mb-6 text-2xl font-medium">
            Order Items
          </h2>
          <div className="space-y-6">
            {order.lineItems.map((item, index) => {
              const product = item.productVariant.product;
              const image =
                item.productVariant.images[0] ?? product.images[0] ?? null;

              return (
                <div
                  key={`${item.productVariant.id}-${index}`}
                  className="flex gap-4 border-b border-border pb-6"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden bg-secondary">
                    {image && (
                      <YnsMedia
                        src={image}
                        alt={product.name}
                        fill
                        sizes="80px"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/product/${product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {money(BigInt(unitPrice(item)) * BigInt(item.quantity))}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-label="Order summary"
          className="mb-12 rounded-lg border border-border p-6"
        >
          <h2 className="mb-4 text-xl font-medium">Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            {order.shipping && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{order.shipping.name}</dt>
                <dd>
                  {money(
                    displayPrice(order.shipping, config.taxBehavior) ??
                      order.shipping.price,
                  )}
                </dd>
              </div>
            )}
            {config.taxBehavior === "exclusive" && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>{money(order.tax)}</dd>
              </div>
            )}
            {config.taxBehavior === "inclusive" && (
              <p className="text-muted-foreground">Includes tax</p>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>
        </section>

        {order.shippingAddress && (
          <section aria-label="Shipping address" className="mb-12">
            <h2 className="mb-4 text-xl font-medium">Shipping Address</h2>
            <address className="not-italic text-sm leading-relaxed">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p>{order.shippingAddress.line2}</p>
              )}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state
                  ? `, ${order.shippingAddress.state}`
                  : ""}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </address>
          </section>
        )}

        <Link to="/" className={cn(buttonVariants(), "w-max")}>
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
