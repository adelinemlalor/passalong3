import { createFileRoute } from "@tanstack/react-router";
import { Auth } from "@/components/live/auth";
import { liveHead, safeNext } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s["next"]) }),
  head: () =>
    liveHead(
      "Sign in",
      "Sign in to Passalong with Google or an email link to join your trusted circle.",
    ),
  component: Page,
});
function Page() {
  const { next } = Route.useSearch();
  return <Auth next={next} />;
}
