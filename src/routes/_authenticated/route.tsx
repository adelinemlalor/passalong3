import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LiveProvider } from "@/components/live/context";
import { LiveShell } from "@/components/live/shell";
import { Onboarding } from "@/components/live/wishes";
import { useLive } from "@/components/live/context";
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", search: { next: location.href } });
  },
  component: Gate,
});
function Gate() {
  return (
    <LiveProvider>
      <MemberShell />
    </LiveProvider>
  );
}
function MemberShell() {
  const { data, circleId } = useLive();
  return (
    <LiveShell>{circleId && !data.profile?.onboarded ? <Onboarding /> : <Outlet />}</LiveShell>
  );
}
