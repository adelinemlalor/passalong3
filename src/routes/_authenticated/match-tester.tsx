import { createFileRoute } from "@tanstack/react-router";
import { MatchTester } from "@/components/live/match-tester";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/match-tester")({ head: () => liveHead("Match tester", "Evaluate the same whole-word matching rule used by Passalong."), component: MatchTester });