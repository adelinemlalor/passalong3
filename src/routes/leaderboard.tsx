import { PassalongProvider } from '@/components/passalong/state';
import { features } from '@/lib/passalong/features';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { Leaderboard } from '@/components/passalong/rewards';
import { AppShell } from '@/components/passalong/shell';
import { usePassalong } from '@/components/passalong/state';
import { pageHead } from '@/lib/passalong/data';
export const Route = createFileRoute('/leaderboard')({ beforeLoad:()=>{if(!features.leaderboard)throw redirect({to:'/'});}, head: () => pageHead('Circle heroes', 'Top givers in your circles this month, and how your circles compare in items passed along.'), component: Page });
function Page() {
  const s = usePassalong();
  return <AppShell>{s.testSettings.gamification ? <Leaderboard /> : <div className="notif-page"><div className="empty-state"><h3>Leaderboard is off</h3><p>Points and the leaderboard are hidden right now. You can switch them back on in Test settings.</p><Link to="/profile" className="back-link">Your profile</Link></div></div>}</AppShell>;
}
