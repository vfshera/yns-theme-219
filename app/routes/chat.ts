import type { Route } from "./+types/chat";
import { chatReply } from "~/lib/mock-store/chat.server";

/** Resource route: the chat panel posts here through useFetcher. */
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  return Response.json(chatReply(form.get("message")));
}
