import { features } from '@/lib/passalong/features';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { NotificationSettings } from '@/components/passalong/notifications';
import { AppShell } from '@/components/passalong/shell';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/notifications/settings')({ beforeLoad:()=>{if(!features.testSettings)throw redirect({to:'/'});}, head: () => pageHead('Notification settings', 'Choose how often Passalong pings you, who you hear from, categories, and quiet hours.'), component: Page });
function Page() { return <AppShell><NotificationSettings /></AppShell>; }
