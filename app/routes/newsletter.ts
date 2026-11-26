import type { Route } from "./+types/newsletter";
import { subscribeToNewsletter } from "~/lib/mock-store/newsletter.server";

/** Resource route: both the footer form and the popup post here through useFetcher. */
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  return Response.json(
    subscribeToNewsletter(form.get("email"), form.get("marketingConsent")),
  );
}
