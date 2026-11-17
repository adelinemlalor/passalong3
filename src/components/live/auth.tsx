import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { HandHeart, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { safeNext } from "@/lib/passalong/live-rules";
import { Failure } from "./failure";
export function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="google-logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}
export function Auth({ next = "/" }: { next?: string }) {
  const navigate = useNavigate(),
    [email, setEmail] = useState(""),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [failure, setFailure] = useState<"magic" | "google" | null>(null);
  const target = safeNext(next);
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const stored = sessionStorage.getItem("passalong-next");
        sessionStorage.removeItem("passalong-next");
        void navigate({ to: safeNext(stored ?? target), replace: true });
      }
    });
  }, [navigate, target]);
  async function magic() {
    setBusy(true);
    setFailure(null);
    try {
    sessionStorage.setItem("passalong-next", target);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/auth?next=" + encodeURIComponent(target),
      },
    });
    setBusy(false);
    if (error) setFailure("magic");
    else setSent(true);
    } catch { setFailure("magic"); } finally { setBusy(false); }
  }
  async function google() {
    setBusy(true);
    setFailure(null);
    try {
    sessionStorage.setItem("passalong-next", target);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      setFailure("google");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    await navigate({ to: target, replace: true });
    } catch { setFailure("google"); setBusy(false); }
  }
  return (
    <div className="live-auth">
      <Link to="/" className="brand">
        <HandHeart className="text-primary" />
        Passalong<span className="text-primary">.</span>
      </Link>
      <div className="live-auth-inner">
        <p className="eyebrow">HAAS FTMBA 2027</p>
        <h1>A good thing starts with your circle.</h1>
        {failure && <Failure retry={() => { if (failure === "magic") void magic(); else void google(); }} />}
        {sent ? (
          <section className="live-notice" role="status">
            <Mail className="text-primary mb-3" />
            <h2 className="text-lg font-semibold">Check your email</h2>
            <p className="mt-2">We sent a sign-in link. Open it to continue to your circle.</p>
            <Button className="mt-4" variant="outline" onClick={() => setSent(false)}>
              Use a different email
            </Button>
          </section>
        ) : (
          <>
            <Button
              className="google-button w-full"
              variant="outline"
              disabled={busy}
              onClick={google}
            >
              <GoogleLogo />
              Continue with Google
            </Button>
            <div className="live-divider">or</div>
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void magic();
              }}
            >
              <label className="form-label">
                Email
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  className="text-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <Button type="submit" disabled={busy}>
                <Mail />
                Email me a sign-in link
              </Button>
            </form>
          </>
        )}
        <p className="live-auth-foot">Haas FTMBA 2027 requires a verified @berkeley.edu email.</p>
        <Button variant="link" asChild><Link to="/how-it-works">How Passalong works & what we record</Link></Button>
      </div>
    </div>
  );
}
