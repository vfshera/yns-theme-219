import type { Route } from "./+types/restock";
import { requestRestock } from "~/lib/mock-store/restock.server";

/** Resource route: the sold-out product page posts here through useFetcher. */
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  return Response.json(
    requestRestock(
      form.get("productVariantId"),
      form.get("email"),
      form.get("marketingConsent"),
    ),
  );
}
