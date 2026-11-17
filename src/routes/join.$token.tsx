import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getInvitePreview, liveAction } from "@/lib/passalong/live.functions";
import { liveHead } from "@/lib/passalong/live-rules";
import { useSession } from "@/components/live/session";
import { Button } from "@/components/ui/button";
import { InvalidLink, RouteFailure } from "@/components/live/failure";
export const Route = createFileRoute("/join/$token")({
  loader: ({ params }) => /^[0-9a-f-]{36}$/i.test(params.token) ? getInvitePreview({ data: { token: params.token } }) : null,
  errorComponent: RouteFailure,
  notFoundComponent: InvalidLink,
  head: () =>
    liveHead(
      "Join your circle",
      "Join the Haas FTMBA 2027 circle by invitation, with no contact uploads.",
    ),
  component: Join,
});
function Join() {
  const { token } = Route.useParams(),
    circle = Route.useLoaderData(),
    { user, loading } = useSession(),
    run = useServerFn(liveAction),
    navigate = useNavigate(),
    [error, setError] = useState("");
  useEffect(() => {
    if (!user || !circle) return;
    let active = true;
    void run({ data: { action: "join", payload: { token } } })
      .then(() => {
        if (active) void navigate({ to: "/home", replace: true });
      })
      .catch((e) => setError(e.message));
    return () => {
      active = false;
    };
  }, [user, circle, run, token, navigate]);
  if (!circle) return <InvalidLink />;
  return (
    <main className="app-main flow-page">
      <p className="eyebrow">PASSALONG</p>
      <h1>{circle ? `Join ${circle.name}` : "This invite is not valid"}</h1>
      {error ? (
        <section className="empty-state" role="alert"><p>{error}</p><Button className="mt-4" asChild variant="outline"><Link to="/profile">Go to your profile</Link></Button></section>
      ) : loading || user ? (
        <p>Joining your circle…</p>
      ) : (
        circle && (
          <Button asChild className="mt-5">
            <Link to="/auth" search={{ next: `/join/${token}` }}>
              Sign in and join
            </Link>
          </Button>
        )
      )}
    </main>
  );
}
