import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
const Session = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});
export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter(),
    q = useQueryClient(),
    [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      setUser(session?.user ?? null);
      setLoading(false);
      void router.invalidate();
      if (event !== "SIGNED_OUT") void q.invalidateQueries();
      else {
        void q.cancelQueries();
        q.clear();
      }
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user);
        setLoading(false);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, q]);
  return <Session.Provider value={{ user, loading }}>{children}</Session.Provider>;
}
export function useSession() {
  return useContext(Session);
}
