import { createFileRoute } from '@tanstack/react-router';
import { StartCircle } from '@/components/passalong/circles';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/start-circle')({
  head: () => pageHead('Start a circle', 'Name your circle, pick a type, and share the invite link — no contacts uploaded.'),
  component: StartCircle,
});
