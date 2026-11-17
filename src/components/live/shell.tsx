import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Home,
  Layers,
  Plus,
  MessageCircle,
  UserRound,
  Bell,
  HandHeart,
  LogOut,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLive } from "./context";
export function LiveShell({ children }: { children: ReactNode }) {
  const { data, circleFilter, setCircleId } = useLive(),
    location = useLocation(),
    navigate = useNavigate(),
    q = useQueryClient();
  async function signOut() {
    await q.cancelQueries();
    q.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", search: { next: "/home" }, replace: true });
  }
  const tabs = [
    { to: "/home", label: "Home", Icon: Home },
    { to: "/swipe", label: "Swipe", Icon: Layers },
    { to: "/post", label: "Post", Icon: Plus },
    { to: "/messages", label: "Messages", Icon: MessageCircle },
    { to: "/profile", label: "You", Icon: UserRound },
  ] as const;
  return (
    <div className="live-app">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/home" className="brand">
            <HandHeart className="text-primary" />
            Passalong<span className="text-primary">.</span>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <Button asChild variant="ghost" size="icon" title="My circles"><Link to="/circles" aria-label="My circles"><Users/></Link></Button>
              <select
                aria-label="Circle"
                value={circleFilter}
                onChange={(e) => setCircleId(e.target.value)}
                className="text-input circle-switcher"
              >
                <option value="">All my circles</option>
                {data.circles
                  .map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            <Button variant="ghost" size="icon" asChild title="Notifications">
              <Link to="/notifications" aria-label="Notifications">
                <Bell />
                {data.notifications.some(n=>!n.read_at)&&<span className="text-xs text-primary" aria-label="Unread notifications">{data.notifications.filter(n=>!n.read_at).length}</span>}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut />
            </Button>
          </div>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map(({ to, label, Icon }) => (
          <Button
            asChild
            variant="ghost"
            key={to}
            className={`nav-tab ${location.pathname === to || (to === "/messages" && location.pathname.startsWith("/messages/")) ? "nav-active" : ""}`}
          >
            <Link to={to}>
              <Icon />
              <span>{label}</span>
              {to==="/messages"&&data.chatMessages.some(m=>m.sender_id!==data.userId&&!m.seen_at)&&<span className="text-xs text-primary" aria-label="Unread messages">{data.chatMessages.filter(m=>m.sender_id!==data.userId&&!m.seen_at).length}</span>}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}
