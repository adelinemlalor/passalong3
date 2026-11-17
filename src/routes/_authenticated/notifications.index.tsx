import { createFileRoute } from "@tanstack/react-router";
import { Notifications } from "@/components/live/profile";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/notifications/")({
  head: () => liveHead("Your notifications"),
  component: () => <Notifications />,
});
