import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/live/feed";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/browse")({
  head: () => liveHead("Browse items"),
  component: () => <Feed browse />,
});
