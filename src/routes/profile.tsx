import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '@/components/passalong/profile';
import { AppShell } from '@/components/passalong/shell';
import { pageHead, contacts, selfIndex } from '@/lib/passalong/data';
export const Route=createFileRoute('/profile')({validateSearch:(search:Record<string,unknown>):{giver?:string}=>typeof search['giver']==='string'?{giver:search['giver']}:{},head:({match})=>{const person=contacts[Number(match.search.giver??selfIndex)]??contacts[selfIndex];return pageHead(`${person.name} ${person.last} · Your circles`,`${person.name}’s trusted circles, favorite secondhand finds, and things given a second life.`);},component:Page});
function Page(){const {giver}=Route.useSearch();return <AppShell><Profile {...(giver ? {giver} : {})}/></AppShell>;}
