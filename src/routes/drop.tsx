import { createFileRoute } from '@tanstack/react-router';
import { SundayDrop } from '@/components/passalong/drop';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
import { dropDate } from '@/lib/passalong/drop';
export const Route=createFileRoute('/drop')({head:()=>pageHead(`Sunday Drop · ${dropDate}`,'A weekly digital garage sale inside your circles. Discover a fresh batch of useful things every Sunday at 10am, friends first.'),component:Page});
function Page(){return <AppShell><SundayDrop/></AppShell>;}
