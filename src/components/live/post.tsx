import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PhotoPicker } from "@/components/passalong/photo-picker";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, CONDITIONS, PICKUP_AREAS } from "@/lib/passalong/live-rules";
import { useLive } from "./context";
import { NoCircle } from "./feed";
export function Post() {
  const { circleId, data, act, busy } = useLive(),
    navigate = useNavigate();
  const [image, setImage] = useState(""),
    [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [condition, setCondition] = useState(""),
    [category, setCategory] = useState(""),
    [area, setArea] = useState(""),
    [nudge, setNudge] = useState(false),
    [uploading, setUploading] = useState(false);
  if (!circleId) return <NoCircle />;
  async function review() {
    await act("event", { circle_id: circleId, name: "post_nudge_shown" });
    setNudge(true);
  }
  async function publish() {
    setUploading(true);
    try {
      const file = await fetch(image).then((r) => r.blob());
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Please choose a photo smaller than 10 MB.");
      const path = `${data.userId}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"}`;
      const { error } = await supabase.storage
        .from("item-photos")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const result = await act("post", {
        circle_id: circleId,
        title,
        description,
        condition,
        category,
        pickup_area: area,
        photo_path: path,
      });
      toast.success("Your item is live in your circle.");
      if (result.id) await navigate({ to: "/i/$id", params: { id: result.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Your item could not be posted.");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="flow-page live-form">
      <p className="eyebrow">PASS IT ON</p>
      <h1>A new home for a good thing</h1>
      <PhotoPicker image={image} onChange={setImage} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void review();
        }}
        className="grid gap-5 mt-6"
      >
        <label className="form-label">
          Title
          <input
            required
            maxLength={120}
            className="text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="form-label">
          Condition
          <select
            required
            className="text-input"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Choose condition</option>
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
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
        <label className="form-label">
          Pickup area
          <select
            required
            className="text-input"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="">Choose a general area</option>
            {PICKUP_AREAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Your own description (optional)
          <textarea
            maxLength={2000}
            rows={3}
            className="text-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <Button type="submit" disabled={!image || busy}>
          Post
        </Button>
      </form>
      {nudge && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Before posting"
            className="modal-panel"
          >
            <h2 className="text-xl font-semibold mb-3">One little check</h2>
            <p>
              Would a friend actually want this? Passalong works best for things that are still
              useful.
            </p>
            <div className="flex gap-3 mt-5">
              <Button disabled={uploading || busy} onClick={publish}>
                {uploading ? "Posting…" : "Continue and post"}
              </Button>
              <Button variant="ghost" disabled={uploading} onClick={() => setNudge(false)}>
                Go back
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
