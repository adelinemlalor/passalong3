import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/live/feed";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/home")({
  head: () => liveHead("Your circle"),
  component: () => <Feed />,
});
