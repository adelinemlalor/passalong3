import { createFileRoute } from "@tanstack/react-router";
import { Post } from "@/components/live/post";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/post")({
  head: () => liveHead("Post an item"),
  component: () => <Post />,
});
