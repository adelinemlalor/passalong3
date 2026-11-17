import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORIES, EVENT_NAMES } from "@/lib/passalong/live-rules";
import { getAdminMetrics, getSynonyms } from "@/lib/passalong/live.functions";
import { useLive } from "./context";
interface Metrics {
  counts: { week: string; name: string; count: number }[];
  outcomes: {
    week: string;
    posted: number;
    claimed_within_3_days: number;
    median_hours_to_claim: number | null;
  }[];
  active: { week: string; members: number }[];
  reports: { id: string; claim_id: string; reason: string; created_at: string }[];
}
export function Admin() {
  const { data, act, busy } = useLive(),
    metricsFn = useServerFn(getAdminMetrics),
    synonymsFn = useServerFn(getSynonyms),
    [name, setName] = useState(""),
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
  if (!data.isAdmin)
    return (
      <div className="empty-state">
        <h1>Admin access required</h1>
        <p>Only a circle admin can view this page.</p>
      </div>
    );
  const m = metrics.data as unknown as Metrics | undefined;
  const weeks = Array.from(new Set(m?.counts.map((c) => c.week) ?? []));
  return (
    <div className="live-admin">
      <h1>Circle admin</h1>
      <section className="live-section">
        <h2>Create a circle</h2>
        <form
          className="live-wish-form"
          onSubmit={async (e) => {
            e.preventDefault();
            await act("create_circle", { name });
            setName("");
            toast.success("Circle created. Copy its invite link from your profile.");
          }}
        >
          <label className="form-label">
            Circle name
            <input
              className="text-input"
              maxLength={100}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={busy}>
            Create circle
          </Button>
        </form>
      </section>
      <section className="live-section">
        <h2>Weekly activity</h2>
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
                    {EVENT_NAMES.map((event) => (
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
              <p className="mt-3 text-sm">
                Weekly active members: {m?.active.find((a) => a.week === week)?.members ?? 0}
              </p>
            </div>
          ))
        )}
      </section>
      <section className="live-section">
        <h2>Item outcomes</h2>
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
          <label className="form-label">
            Category
            <select
              className="text-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
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
              {s.category}: {s.words.join(", ")}
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
