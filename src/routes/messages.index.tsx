import { createFileRoute } from '@tanstack/react-router';
import { MessagesList } from '@/components/passalong/messages';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/messages/')({ head: () => pageHead('Messages', 'Quick hand-off conversations with your circles: claims, pickups, and thank-yous in a few taps.'), component: Page });
function Page() { return <AppShell><MessagesList /></AppShell>; }
