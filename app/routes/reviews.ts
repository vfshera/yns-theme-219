import type { Route } from "./+types/reviews";
import { submitReview } from "~/lib/mock-store/reviews.server";

/** Resource route: the product page's review form posts here through useFetcher. */
export async function action({ request }: Route.ActionArgs) {
  return Response.json(submitReview(await request.formData()));
}
