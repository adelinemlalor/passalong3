import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/passalong/live-rules";
import { useLive } from "./context";
import { EmptyCircle, NoCircle, ItemCard, available } from "./feed";
export function WishForm({ limit }: { limit?: number }) {
  const { data, circleId, act, busy } = useLive();
  const [text, setText] = useState(""),
    [category, setCategory] = useState("");
  const wishes = data.wishes.filter((w) => w.circle_id === circleId);
  return (
    <>
      <form
        className="live-wish-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await act("wish", { circle_id: circleId, text, category });
          setText("");
          setCategory("");
        }}
      >
        <label className="form-label">
          Wish
          <input
            required
            maxLength={60}
            placeholder="e.g. puzzles"
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label className="form-label">
          Category
          <select
            required
            className="text-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Choose category</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <Button type="submit" disabled={busy || (limit !== undefined && wishes.length >= limit)}>
          <Heart />
          Add wish
        </Button>
      </form>
      <div>
        {wishes.map((w) => (
          <div className="live-wish-row" key={w.id}>
            <div>
              <strong>{w.text}</strong>
              <p className="text-sm text-muted-foreground">{w.category}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              title="Remove wish"
              aria-label={`Remove ${w.text}`}
              disabled={busy}
              onClick={() => act("delete_wish", { circle_id: circleId, wish_id: w.id })}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
export function Wishes() {
  const { circleId } = useLive();
  if (!circleId) return <NoCircle />;
  return (
    <div className="flow-page">
      <p className="eyebrow">JUST FOR YOU</p>
      <h1>My wishlist</h1>
      <WishForm />
    </div>
  );
}
export function Onboarding() {
  const { data, circleId, act, busy } = useLive(),
    [step, setStep] = useState(0);
  if (!circleId) return <NoCircle />;
  const items = data.items.filter((i) => i.circle_id === circleId && available(i));
  return (
    <div className="live-onboarding">
      <p className="eyebrow">WELCOME TO YOUR CIRCLE</p>
      <h1>
        {step === 0
          ? `${items.length} things are available in your circle right now`
          : "What are you wishing for?"}
      </h1>
      <p className="live-notice">
        We record how you use Passalong (posts, claims, pickups) to improve it. We never record your
        wishlist text in analytics.
      </p>
      {step === 0 ? (
        <>
          {items.length ? (
            <div className="live-grid">
              {items.slice(0, 3).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyCircle />
          )}
          <Button className="mt-6" onClick={() => setStep(1)}>
            Continue
          </Button>
        </>
      ) : (
        <>
          <WishForm limit={3} />
          <div className="flex gap-3 mt-6">
            <Button disabled={busy} onClick={() => act("profile", { onboarded: true })}>
              Done
            </Button>
            <Button
              disabled={busy}
              variant="ghost"
              onClick={() => act("profile", { onboarded: true })}
            >
              Skip for now
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
