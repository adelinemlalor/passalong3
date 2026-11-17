import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@/components/passalong/home';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route=createFileRoute('/')({head:()=>pageHead('Good things, closer to home','Find useful things and helping hands from friends and trusted circles. A little less clutter, a little more connection.'),component:Index});
function Index(){return <AppShell><Home/></AppShell>;}
