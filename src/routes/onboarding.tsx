import { createFileRoute } from '@tanstack/react-router';
import { Onboarding } from '@/components/passalong/onboarding';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route=createFileRoute('/onboarding')({head:()=>pageHead('Make yourself at home','Join the circles you already trust, connect with friends, and find your kind of good.'),component:Page});
function Page(){return <AppShell><Onboarding/></AppShell>;}
