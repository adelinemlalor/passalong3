import { createFileRoute } from "@tanstack/react-router";
import { Swipe } from "@/components/live/feed";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/swipe")({
  head: () => liveHead("Swipe items"),
  component: () => <Swipe />,
});
