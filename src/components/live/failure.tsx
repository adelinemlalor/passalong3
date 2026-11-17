import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useSession } from "./session";
export function InvalidLink() {
  const { user } = useSession();
  return <main className="app-main empty-state"><h1>This link has expired or the item was removed.</h1><Button className="mt-5" asChild><Link to={user ? "/home" : "/auth"} search={{ next: "/home" }}>{user ? "Go to your circle" : "Join Passalong"}</Link></Button></main>;
}
export function Failure({ retry, message = "Something went wrong on our side. Nothing you entered was lost." }: { retry: () => void; message?: string | undefined }) {
  return <section className="empty-state" role="alert"><h2>{message}</h2><Button className="mt-5" variant="outline" onClick={retry}>Try again</Button></section>;
}
export function RouteFailure({ reset }: { reset: () => void }) {
  const router = useRouter();
  return <main className="app-main"><Failure retry={() => { void router.invalidate().then(reset); }} /></main>;
}
export function ConditionDisclosure() {
  return <p className="text-xs text-muted-foreground mt-2">Described by the giver. Passalong doesn't inspect items.</p>;
}