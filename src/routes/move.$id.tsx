import { createFileRoute } from '@tanstack/react-router';
import { BundlePage } from '@/components/passalong/collections';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/move/$id')({ head: () => pageHead('Move bundle', 'Someone in your circle is moving — claim the individual things you’d like, all with one pickup.'), component: Page });
function Page() { const { id } = Route.useParams(); return <AppShell><BundlePage id={id} /></AppShell>; }
