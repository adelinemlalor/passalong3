import { createFileRoute } from "@tanstack/react-router";
import { Profile } from "@/components/live/profile";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/profile")({
  head: () => liveHead("Your profile"),
  component: () => <Profile />,
});
