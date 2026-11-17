import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "@/components/live/messages";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/messages/$id")({
  head: () => liveHead("Pickup conversation"),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <Chat id={id} />;
}
