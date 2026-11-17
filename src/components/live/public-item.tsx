import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { HandHeart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { joinItem, type getItemPreview } from "@/lib/passalong/live.functions";
import { useSession } from "./session";
import { LiveProvider, useLive } from "./context";
import { LiveShell } from "./shell";
import { MemberDetail } from "./detail";
type Preview = Awaited<ReturnType<typeof getItemPreview>>;
export function PublicItem({ item, id }: { item: Preview; id: string }) {
  const { user, loading } = useSession();
  if (loading) return <main className="app-main">Loading item…</main>;
  if (user)
    return (
      <LiveProvider>
        <ItemAccess item={item} id={id} />
      </LiveProvider>
    );
  return <SafePreview item={item} id={id} />;
}
function ItemAccess({ item, id }: { item: Preview; id: string }) {
  const { data } = useLive();
  return data.items.some((i) => i.id === id) ? (
    <LiveShell>
      <MemberDetail id={id} />
    </LiveShell>
  ) : (
    <SafePreview item={item} id={id} />
  );
}
function SafePreview({ item, id }: { item: Preview; id: string }) {
  const { user } = useSession(),
    join = useServerFn(joinItem),
    navigate = useNavigate(),
    [busy, setBusy] = useState(false);
  if (!item)
    return (
      <main className="app-main empty-state">
        <h1>This item is no longer available</h1>
        <Button asChild className="mt-5">
          <Link to="/">Go to Passalong</Link>
        </Button>
      </main>
    );
  async function enter() {
    if (!user) {
      await navigate({ to: "/auth", search: { next: `/i/${id}` } });
      return;
    }
    setBusy(true);
    try {
      await join({ data: { id } });
      await navigate({ to: "/i/$id", params: { id }, replace: true });
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not join the circle.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <HandHeart className="text-primary" />
            Passalong.
          </Link>
        </div>
      </header>
      <main className="app-main">
        <div className="detail-grid">
          <div className="detail-photo">
            <img src={item.photo_url} alt={item.title} />
          </div>
          <section className="detail-info">
            <p className="eyebrow">{item.circle_name}</p>
            <h1>{item.title}</h1>
            <p>{item.condition}</p>
            <Button disabled={busy} className="mt-6 live-wrap-button" onClick={enter}>
              Join {item.circle_name} to claim
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
