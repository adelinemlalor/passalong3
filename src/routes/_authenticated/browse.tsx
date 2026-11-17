import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/live/feed";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/browse")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => typeof search["category"] === "string" ? { category: search["category"] } : {},
  head: () => liveHead("Browse items"),
  component: () => <Feed browse initialCategory={Route.useSearch().category} />,
});
