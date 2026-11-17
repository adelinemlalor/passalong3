import { createFileRoute } from '@tanstack/react-router';
import { ItemDetail } from '@/components/passalong/detail';
import { AppShell } from '@/components/passalong/shell';
import { offers, pageHead } from '@/lib/passalong/data';
import { dropOffers } from '@/lib/passalong/drop';
import { matchingOffers } from '@/lib/passalong/matching';
export const Route=createFileRoute('/item/$id')({head:({params})=>{const offer=[...offers,...dropOffers,...matchingOffers].find(o=>o.id===params.id);return pageHead(offer?.title??'A little good thing',offer?.description??'A useful thing from a trusted circle-mate, ready for its next chapter.');},component:Page});
function Page(){const {id}=Route.useParams();return <AppShell><ItemDetail id={id}/></AppShell>;}
