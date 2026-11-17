import { createFileRoute } from "@tanstack/react-router";
import { CircleForm } from "@/components/live/circles";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/start-circle")({
  head: () => liveHead("Start a circle", "Create a trusted circle for your class, group, building or team on Passalong."),
  component: () => <CircleForm />,
});
