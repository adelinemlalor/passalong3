import { createFileRoute } from '@tanstack/react-router';
import { ConversationView } from '@/components/passalong/messages';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/messages/$id')({ head: () => pageHead('Conversation', 'Arrange a friendly pickup with quick replies, time suggestions, and a hand-off tracker.'), component: Page });
function Page() { const { id } = Route.useParams(); return <AppShell><ConversationView id={id} /></AppShell>; }
