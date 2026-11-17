import { createFileRoute } from "@tanstack/react-router";
import { Chats } from "@/components/live/messages";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/messages/")({
  head: () => liveHead("Pickup chats"),
  component: () => <Chats />,
});
