import { createFileRoute, redirect } from '@tanstack/react-router';
import { liveHead } from '@/lib/passalong/live-rules';
export const Route=createFileRoute('/item/$id')({beforeLoad:({params})=>{throw redirect({to:'/i/$id',params:{id:params.id}});},head:()=>liveHead('Shared item')});
