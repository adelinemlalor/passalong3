import { createFileRoute, notFound } from '@tanstack/react-router';
import { CollectionPage } from '@/components/passalong/collections';
import { AppShell } from '@/components/passalong/shell';
import { collections, type CollectionId } from '@/lib/passalong/collections';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/collections/$id')({
  loader: ({ params }) => { if (!collections.some(c => c.id === params.id)) throw notFound(); return null; },
  head: ({ params }) => { const c = collections.find(x => x.id === params.id); return pageHead(c?.title ?? 'Collection', c?.header ?? 'Themed collections from your circles.'); },
  component: Page,
});
function Page() { const { id } = Route.useParams(); return <AppShell><CollectionPage id={id as CollectionId} /></AppShell>; }
