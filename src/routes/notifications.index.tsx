import { createFileRoute } from '@tanstack/react-router';
import { NotificationsInbox } from '@/components/passalong/notifications';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/notifications/')({ head: () => pageHead('Notifications', 'Your Sunday Drop, wishlist matches, claims, and circle requests in one calm inbox.'), component: Page });
function Page() { return <AppShell><NotificationsInbox /></AppShell>; }
