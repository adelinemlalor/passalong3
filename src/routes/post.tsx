import { createFileRoute } from '@tanstack/react-router';
import { PostFlow } from '@/components/passalong/post';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route=createFileRoute('/post')({head:()=>pageHead('Pass a little good along','Give a useful thing a second chapter or offer a helping hand. Share with your friends first.'),component:Page});
function Page(){return <AppShell><PostFlow/></AppShell>;}
