import { createFileRoute } from "@tanstack/react-router";
import { MyCircles } from "@/components/live/circles";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route = createFileRoute("/_authenticated/circles")({head:()=>liveHead("My circles","See your trusted circles, members and invitations on Passalong."),component:MyCircles});