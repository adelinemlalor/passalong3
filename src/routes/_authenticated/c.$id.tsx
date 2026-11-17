import { createFileRoute } from "@tanstack/react-router";
import { CirclePage } from "@/components/live/circles";
import { liveHead } from "@/lib/passalong/live-rules";
export const Route=createFileRoute("/_authenticated/c/$id")({validateSearch:(input:Record<string,unknown>):{created?:boolean}=>({created:input["created"]===true||input["created"]==="true"}),head:()=>liveHead("Circle items and members","Your circle’s available items and private member list on Passalong."),component:Page});
function Page(){const {id}=Route.useParams(),{created}=Route.useSearch();return <CirclePage id={id} created={created??false}/>;}