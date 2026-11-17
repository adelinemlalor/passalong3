import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/live/feed";
import { liveHead } from "@/lib/passalong/live-rules";
import { useLive } from "@/components/live/context";
import { Onboarding } from "@/components/live/wishes";
export const Route = createFileRoute("/_authenticated/home")({
  head: () => liveHead("Your circle"),
  component: Home,
});
export function Home() {
  const { data, circleId } = useLive();
  return circleId && !data.profile?.onboarded ? <Onboarding /> : <Feed />;
}
