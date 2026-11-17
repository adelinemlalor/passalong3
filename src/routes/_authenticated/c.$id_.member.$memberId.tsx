import { createFileRoute } from "@tanstack/react-router";
import { CircleMember } from "@/components/live/circles";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route=createFileRoute("/_authenticated/c/$id_/member/$memberId")({head:()=>liveHead("Circle member","A private circle member profile on Passalong."),component:Page});
function Page(){const {id,memberId}=Route.useParams();return <CircleMember id={id} memberId={memberId}/>;}