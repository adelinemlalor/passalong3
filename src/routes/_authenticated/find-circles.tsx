import { createFileRoute } from "@tanstack/react-router";
import { FindCircles } from "@/components/live/circles";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/find-circles")({head:()=>liveHead("Find circles near you","Find open circles by your general area, without GPS or contact uploads."),component:FindCircles});