import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LiveProvider } from "@/components/live/context";
import { LiveShell } from "@/components/live/shell";
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
      <LiveShell><Outlet /></LiveShell>
    </LiveProvider>
  );
}
