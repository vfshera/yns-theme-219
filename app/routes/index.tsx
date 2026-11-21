import type { Route } from "./+types/index";

export const meta: Route.MetaFunction = () => [{ title: "YNS Theme" }];

export default function Index() {
  return (
    <main className="flex items-center justify-center pt-16">
      <h1 className="text-2xl font-semibold">YNS Theme</h1>
    </main>
  );
}
