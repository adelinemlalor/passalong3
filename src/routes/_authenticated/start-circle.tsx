import { createFileRoute } from "@tanstack/react-router";
import { Admin } from "@/components/live/admin";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/start-circle")({
  head: () => liveHead("Create a circle"),
  component: () => <Admin />,
});
