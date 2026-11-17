import { createFileRoute } from "@tanstack/react-router";
import { Wishes } from "@/components/live/wishes";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => liveHead("My wishlist"),
  component: () => <Wishes />,
});
