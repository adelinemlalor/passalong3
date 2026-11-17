import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send, Flag, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getChat } from "@/lib/passalong/live.functions";
import { useLive } from "./context";
export function Chats() {
  const { data } = useLive();
  return (
    <div className="notif-page">
      <div className="live-heading">
        <h1>Pickup chats</h1>
      </div>
      {!data.claims.length ? (
        <div className="empty-state">
          <MessageCircle />
          <h3>No pickup chats yet</h3>
          <p>Claim an item to start a conversation with its giver.</p>
          <Button asChild variant="outline">
            <Link to="/browse">Browse items</Link>
          </Button>
        </div>
      ) : (
        <div className="convo-list">
          {data.claims.map((c) => {
            const item = data.items.find((i) => i.id === c.item_id);
            return (
              <Link key={c.id} to="/messages/$id" params={{ id: c.id }} className="live-chat-row">
                {item && <img src={item.photo_url} alt={item.title} />}
                <div>
                  <strong>{item?.title ?? "Item"}</strong>
                  <p>{c.status.replaceAll("_", " ")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
export function Chat({ id }: { id: string }) {
  const { data, act, busy } = useLive(),
    fetchChat = useServerFn(getChat),
    [text, setText] = useState(""),
    [report, setReport] = useState(false),
    [reason, setReason] = useState("");
  const claim = data.claims.find((c) => c.id === id),
    item = data.items.find((i) => i.id === claim?.item_id);
  const messages = useQuery({
    queryKey: ["chat", id],
    queryFn: () => fetchChat({ data: { id } }),
    enabled: !!claim,
    refetchInterval: 5000,
  });
  if (!claim || !item)
    return (
      <div className="empty-state">
        <h1>This conversation is private</h1>
      </div>
    );
  const own = item.giver_id === data.userId,
    steps = ["Claimed", "Pickup arranged", "Picked up", "Thanked"],
    current = ["claimed", "pickup_arranged", "picked_up", "thanked"].indexOf(claim.status);
  const other = data.people.find((p) => p.id === (own ? claim.receiver_id : item.giver_id));
  async function send() {
    if (!text.trim()) return;
    await act("message", { claim_id: id, text: text.trim() });
    setText("");
  }
  return (
    <div className="convo-page">
      <div className="convo-header">
        <Link to="/messages">←</Link>
        <div>
          <strong>{other?.display_name ?? "Circle member"}</strong>
          <span className="text-sm text-muted-foreground">Pickup chat</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Report chat"
          title="Report chat"
          onClick={() => setReport(!report)}
        >
          <Flag />
        </Button>
      </div>
      <Link className="pinned-card" to="/i/$id" params={{ id: item.id }}>
        <img src={item.photo_url} alt={item.title} />
        <div>
          <strong>{item.title}</strong>
          <p>
            {item.condition} · {item.pickup_area}
          </p>
        </div>
      </Link>
      <ol className="handoff-tracker">
        {steps.map((s, n) => (
          <li className={n <= current ? "done" : ""} key={s}>
            <span>{n + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {claim.status === "expired" ? (
        <p className="live-notice">
          This claim expired. The item is available again if it has not been claimed.
        </p>
      ) : (
        current < 2 && (
          <div className="live-deadline">
            <p>Pickup by {new Date(claim.pickup_by).toLocaleString()}</p>
            {own && (
              <Button
                disabled={busy}
                size="sm"
                variant="outline"
                onClick={() => act("extend", { claim_id: id })}
              >
                Extend by 48 hours
              </Button>
            )}
          </div>
        )
      )}
      <div className="flex gap-2 flex-wrap my-3">
        {claim.status === "claimed" && (
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => act("arrange", { claim_id: id })}
          >
            Pickup arranged
          </Button>
        )}
        {current >= 0 && current < 2 && (
          <Button disabled={busy} onClick={() => act("pickup", { claim_id: id })}>
            Mark picked up
          </Button>
        )}
        {claim.status === "picked_up" && !own && (
          <Button disabled={busy} onClick={() => act("thank", { claim_id: id })}>
            Thank the giver
          </Button>
        )}
        {claim.status === "thanked" && (
          <p className="done-banner">Picked up and thanked — a good thing passed along.</p>
        )}
      </div>
      {report && (
        <form
          className="grid gap-3 border-y py-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await act("report", { claim_id: id, reason });
            setReport(false);
            setReason("");
            toast.success("Your report was sent to the admin.");
          }}
        >
          <label className="form-label">
            Reason for report
            <textarea
              required
              maxLength={1000}
              className="text-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <Button disabled={busy} type="submit">
            Send report
          </Button>
        </form>
      )}
      <div className="msg-thread" aria-live="polite">
        {messages.isPending ? (
          <p>Loading messages…</p>
        ) : messages.error ? (
          <p role="alert">{messages.error.message}</p>
        ) : !messages.data?.length ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          messages.data.map((m) => (
            <div
              key={m.id}
              className={`msg ${m.sender_id === data.userId ? "msg-me" : "msg-them"}`}
            >
              {m.text}
              <small className="block opacity-70 mt-1">
                {new Date(m.created_at).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </small>
            </div>
          ))
        )}
      </div>
      {claim.status !== "expired" && (
        <div className="composer">
          <div className="quick-replies">
            {[
              "Thanks! When works for you?",
              "Does today at 5 pm work?",
              "Does tomorrow at 10 am work?",
              "I'm on my way!",
              "Thanks for passing this along!",
            ].map((reply) => (
              <Button key={reply} variant="outline" onClick={() => setText(reply)}>
                {reply}
              </Button>
            ))}
          </div>
          <form
            className="composer-input"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              aria-label="Message"
              maxLength={2000}
              className="text-input"
              placeholder="Your message"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              type="submit"
              disabled={busy || !text.trim()}
              size="icon"
              title="Send message"
              aria-label="Send message"
            >
              <Send />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
