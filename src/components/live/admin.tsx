import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EVENT_NAMES } from "@/lib/passalong/live-rules";
import { CategoryPicker } from "./category-picker";
import { CategoryAdmin } from "./category-admin";
import { categoryLabel } from "@/lib/passalong/category-rules";
import { getAdminMetrics, getSynonyms, getAdminMembers } from "@/lib/passalong/live.functions";
import { useLive } from "./context";
interface Metrics {
  replies:{week:string;claims:number;replied_within_24h:number|null}[];
  counts: { week: string; name: string; count: number }[];
  outcomes: {
    week: string;
    posted: number;
    claimed_within_3_days: number;
    median_hours_to_claim: number | null;
  }[];
  active: { week: string; members: number; activity_ratio: number | null }[];
  rates: { no_show: number | null; second_post: number | null; clearout_interest: number | null };
  reports: { id: string; claim_id: string; reason: string; created_at: string }[];
}
export function Admin() {
  const { data, act, busy } = useLive(),
    metricsFn = useServerFn(getAdminMetrics),
    synonymsFn = useServerFn(getSynonyms),
    membersFn = useServerFn(getAdminMembers),
    [testUser,setTestUser] = useState(""),
    [category, setCategory] = useState("Garden"),
    [words, setWords] = useState("");
  const metrics = useQuery({
      queryKey: ["admin-metrics"],
      queryFn: () => metricsFn(),
      enabled: data.isAdmin,
    }),
    synonyms = useQuery({
      queryKey: ["synonyms"],
      queryFn: () => synonymsFn(),
      enabled: data.isAdmin,
    });
  const members = useQuery({ queryKey:["admin-members"],queryFn:()=>membersFn(),enabled:data.isAdmin });
  if (!data.isAdmin)
    return (
      <div className="empty-state">
        <h1>Admin access required</h1>
        <p>Only a circle admin can view this page.</p>
      </div>
    );
  const m = metrics.data as unknown as Metrics | undefined;
  const weeks = Array.from(new Set([...(m?.counts.map((c) => c.week) ?? []),...(m?.replies?.map(r=>r.week)??[])]));
  return (
    <div className="live-admin">
      <h1>Circle admin</h1>
      <Button className="mt-4" asChild variant="outline"><Link to="/match-tester">Match tester</Link></Button>
      <section className="live-section"><h2>Circle access</h2>{data.adminCircles.map(circle=><div className="border-b py-5" key={circle.id}><h3>{circle.name}{circle.is_test ? " · Test" : ""}</h3><p className="text-sm text-muted-foreground my-3">{circle.required_email_domain ? `Verified @${circle.required_email_domain} sign-in required` : circle.is_test ? "Admin-added test accounts only" : "Invite link required"}</p><Button variant="outline" disabled={busy} onClick={async()=>{await act("rotate_invite",{circle_id:circle.id});toast.success("The old invite no longer works. Members can copy the new invite from My circles.");}}>Regenerate invite link</Button>{members.data?.filter(m=>m.circle_id===circle.id).map(m=><div className="live-wish-row" key={m.user_id}><span>{m.display_name}</span>{m.user_id!==data.userId && <Button variant="ghost" disabled={busy} onClick={async()=>{await act("remove_member",{circle_id:circle.id,user_id:m.user_id});await members.refetch();}}>Remove member</Button>}</div>)}{circle.is_test && <form className="flex flex-wrap gap-3 mt-3" onSubmit={async e=>{e.preventDefault();await act("add_test_member",{circle_id:circle.id,user_id:testUser});setTestUser("");await members.refetch();}}><label className="form-label">Test account ID<input required className="text-input" value={testUser} onChange={e=>setTestUser(e.target.value)} /></label><Button type="submit" disabled={busy}>Add test account</Button></form>}</div>)}{!data.adminCircles.some(c=>c.is_test) && <Button className="mt-4" variant="outline" disabled={busy} onClick={()=>act("create_test_circle")}>Create Test circle</Button>}</section>
      <section className="live-section">
        <h2>Create a circle</h2>
        <Button asChild className="mt-4"><Link to="/start-circle">Start a circle</Link></Button>
      </section>
      <section className="live-section">
        <h2>Weekly activity</h2><p className="section-intro">Test-circle activity is excluded. Reply rates include claims at least 24 hours old; a giver’s message, time suggestion or pickup spot counts as a reply. Email delivery is off.</p>
        {metrics.isPending ? (
          <p>Loading counts…</p>
        ) : metrics.error ? (
          <p role="alert">{metrics.error.message}</p>
        ) : !weeks.length ? (
          <p className="text-sm text-muted-foreground mt-3">No activity recorded yet.</p>
        ) : (
          weeks.map((week) => (
            <div className="live-week" key={week}>
              <h3>Week of {week}</h3>
              <div className="live-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...EVENT_NAMES,"claim_email_sent","message_email_sent"].map((event) => (
                      <tr key={event}>
                        <td>{event.replaceAll("_", " ")}</td>
                        <td>
                          {m?.counts.find((c) => c.week === week && c.name === event)?.count ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm">Claims where the giver replied within 24 hours: {m?.replies?.find(r=>r.week===week)?.replied_within_24h ?? "—"}%</p>
              <p className="mt-3 text-sm">
                Weekly active members: {m?.active.find((a) => a.week === week)?.members ?? 0}
              </p>
              <p className="text-sm mt-2">Week-over-week activity ratio: {m?.active.find(a=>a.week===week)?.activity_ratio ?? "—"}</p>
            </div>
          ))
        )}
      </section>
      <section className="live-section">
        <h2>Item outcomes</h2>
        <p className="text-sm text-muted-foreground my-3">Test-circle activity is excluded.</p><dl className="grid gap-3 my-5"><div><dt>No-show rate</dt><dd>{m?.rates?.no_show ?? "—"}%</dd></div><div><dt>Givers who posted a second item</dt><dd>{m?.rates?.second_post ?? "—"}%</dd></div><div><dt>Clear-out interested rate</dt><dd>{m?.rates?.clearout_interest ?? "—"}%</dd></div></dl>
        <div className="live-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Post week</th>
                <th>Items posted</th>
                <th>Claimed within 3 days</th>
                <th>Median hours to claim</th>
              </tr>
            </thead>
            <tbody>
              {m?.outcomes.map((o) => (
                <tr key={o.week}>
                  <td>{o.week}</td>
                  <td>{o.posted}</td>
                  <td>{o.claimed_within_3_days ?? 0}%</td>
                  <td>
                    {o.median_hours_to_claim === null ? "—" : o.median_hours_to_claim.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="live-section">
        <h2>Category synonyms</h2>
        <form
          className="live-wish-form"
          onSubmit={async (e) => {
            e.preventDefault();
            await act("synonym", {
              category,
              words: words
                .split(",")
                .map((w) => w.trim())
                .filter(Boolean),
            });
            setWords("");
            await synonyms.refetch();
          }}
        >
          <CategoryPicker categories={data.categories} value={category} onChange={setCategory}/>
          <label className="form-label">
            Synonyms
            <input
              required
              className="text-input"
              maxLength={500}
              placeholder="seeds, seedlings"
              value={words}
              onChange={(e) => setWords(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={busy}>
            Add group
          </Button>
        </form>
        {synonyms.data?.map((s) => (
          <div key={s.id} className="live-wish-row">
            <p>
              {categoryLabel(s.category,"",data.categories)}: {s.words.join(", ")}
            </p>
            <Button
              disabled={busy}
              variant="ghost"
              size="sm"
              onClick={async () => {
                await act("synonym", { id: s.id });
                await synonyms.refetch();
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </section>
      <CategoryAdmin/>
      <section className="live-section">
        <h2>Chat reports</h2>
        {m?.reports.map((r) => (
          <div className="live-wish-row" key={r.id}>
            <p>{r.reason}</p>
            <small>{new Date(r.created_at).toLocaleString()}</small>
          </div>
        ))}
      </section>
    </div>
  );
}
