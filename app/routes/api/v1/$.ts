import type { Route } from "./+types/$";
import { queryStore } from "~/lib/mock-store/handlers.server";

/** Mock Store API: GET /api/v1/* — no default export, so this is a resource route. */
export function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const body = queryStore(params["*"] ?? "", url.searchParams, url.origin);

  return Response.json(body);
}
