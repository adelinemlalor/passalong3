import { createFileRoute } from "@tanstack/react-router";
import { Onboarding } from "@/components/live/wishes";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => liveHead("Welcome to your circle"),
  component: () => <Onboarding />,
});
