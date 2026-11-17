import { createContext, useContext, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getLiveData, liveAction } from "@/lib/passalong/live.functions";
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
  const { data, error, isPending } = useQuery({
    queryKey: liveQueryKey,
    queryFn: () => fetchData(),
    refetchInterval: 30000,
  });
  const [selected, setSelected] = useState("");
  const mutation = useMutation({
    mutationFn: (input: ActionInput) => run({ data: input }),
    onSuccess: async () => {
      await q.invalidateQueries({ queryKey: liveQueryKey });
      await q.invalidateQueries({ queryKey: ["chat"] });
      await q.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: (e) => toast.error(e.message),
  });
  if (isPending)
    return (
      <main className="app-main">
        <p role="status">Loading your circle…</p>
      </main>
    );
  if (error || !data)
    return (
      <main className="app-main">
        <p role="alert">{error?.message ?? "Your circle could not be loaded."}</p>
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
        act: (action, payload = {}) => mutation.mutateAsync({ action, payload }),
        busy: mutation.isPending,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLive() {
  const value = useContext(Context);
  if (!value) throw new Error("Circle context missing");
  return value;
}
