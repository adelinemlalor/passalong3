import { createFileRoute } from '@tanstack/react-router';
import { Browse } from '@/components/passalong/browse';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/browse')({
  head: () => pageHead('Browse good things', 'Swipe or scroll through everything your circles are passing along right now.'),
  component: () => <AppShell><Browse /></AppShell>,
});
