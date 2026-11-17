import { createFileRoute } from "@tanstack/react-router";
import { CircleForm } from "@/components/live/circles";
import { useLive } from "@/components/live/context";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route=createFileRoute("/_authenticated/c/$id_/edit")({head:()=>liveHead("Edit circle","Manage your circle’s details and joining preferences on Passalong."),component:Page});
function Page(){const {id}=Route.useParams(),{data}=useLive(),circle=data.circles.find(c=>c.id===id);return circle?.my_role==="owner"?<CircleForm circle={circle}/>:<p>Only the circle owner can edit this circle.</p>;}