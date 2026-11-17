import { createContext, useContext, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLiveData, liveAction } from "@/lib/passalong/live.functions";
import { Failure } from "./failure";
import { Button } from "@/components/ui/button";
export const liveQueryKey = ["passalong-live"] as const;
export type LiveData = Awaited<ReturnType<typeof getLiveData>>;
export type LiveItem = LiveData["items"][number];
type ActionInput = Parameters<typeof liveAction>[0]["data"];
const Context = createContext<{
  data: LiveData;
  circleId: string;
  setCircleId: (id: string) => void;
  act: (
    action: ActionInput["action"],
    payload?: ActionInput["payload"],
  ) => Promise<{ id?: string }>;
  busy: boolean;
} | null>(null);
export function LiveProvider({ children }: { children: ReactNode }) {
  const fetchData = useServerFn(getLiveData),
    run = useServerFn(liveAction),
    q = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: liveQueryKey,
    queryFn: () => fetchData(),
    refetchInterval: 30000,
  });
  const [selected, setSelected] = useState("");
  const [actionError, setActionError] = useState("");
  const [retryInput, setRetryInput] = useState<ActionInput | null>(null);
  const mutation = useMutation({
    mutationFn: (input: ActionInput) => run({ data: input }),
    onSuccess: async () => {
      setActionError("");
      setRetryInput(null);
      await q.invalidateQueries({ queryKey: liveQueryKey });
      await q.invalidateQueries({ queryKey: ["chat"] });
      await q.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: (e, input) => { setActionError(e.message); setRetryInput(input); },
  });
  if (isPending)
    return (
      <main className="app-main">
        <p role="status">Loading your circle…</p>
      </main>
    );
  if (!data)
    return (
      <main className="app-main">
        <Failure retry={() => { void q.invalidateQueries({ queryKey: liveQueryKey }); }} />
      </main>
    );
  const circleId = data.circles.some((c) => c.id === selected)
    ? selected
    : (data.circles[0]?.id ?? "");
  return (
    <Context.Provider
      value={{
        data,
        circleId,
        setCircleId: setSelected,
        act: (action, payload = {}) => mutation.mutateAsync({ action, payload: { ...payload, ...(action === "clearout" ? { circle_id: circleId } : {}) } }),
        busy: mutation.isPending,
      }}
    >
      {children}
      {actionError && !actionError.includes("Just missed it") && <div className="modal-backdrop"><section className="modal-panel" role="dialog" aria-modal="true" aria-label="Action could not finish"><Failure message={actionError.includes("berkeley.edu") || actionError.includes("Admin") || actionError.includes("active pickups") ? actionError : undefined} retry={() => { if (retryInput) void mutation.mutateAsync(retryInput).catch(() => {}); }} /><Button variant="ghost" onClick={() => setActionError("")}>Back to my draft</Button></section></div>}
    </Context.Provider>
  );
}
export function useLive() {
  const value = useContext(Context);
  if (!value) throw new Error("Circle context missing");
  return value;
}
