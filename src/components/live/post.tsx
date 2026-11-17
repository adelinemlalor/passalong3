import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PhotoPicker } from "@/components/passalong/photo-picker";
import { supabase } from "@/integrations/supabase/client";
import { CONDITIONS, PICKUP_AREAS } from "@/lib/passalong/live-rules";
import { CategoryPicker } from "./category-picker";
import { useLive } from "./context";
import { NoCircle } from "./feed";
import { PICKUP_STYLES } from "@/lib/passalong/pickup-rules";
import { Failure } from "./failure";
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
    [uploading, setUploading] = useState(false),
    [failure, setFailure] = useState("");
  const [audience,setAudience] = useState(data.circles.map(circle=>circle.id));
  const [customCategory,setCustomCategory]=useState("");
  const [pickupStyle,setPickupStyle]=useState("");
  const [step,setStep]=useState(1);
  const headings=["What’s ready for a second chapter?","Give it a little name","Where does it fit in?","How should they pick it up?","Who can see it?"];
  const ready=[Boolean(image),Boolean(title.trim()&&condition),Boolean(category&&(category!=="other"||customCategory.trim())),Boolean(area&&pickupStyle),Boolean(audience.length)];
  if (!circleId) return <NoCircle />;
  async function review() {
    if(!audience.length)return;
    await act("event", { circle_id: audience[0] ?? circleId, name: "post_nudge_shown" });
    setNudge(true);
  }
  async function publish() {
    setUploading(true);
    setFailure("");
    let photoUploaded = false;
    try {
      const file = await fetch(image).then((r) => r.blob());
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Please choose a photo smaller than 10 MB.");
      const path = `${data.userId}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"}`;
      const { error } = await supabase.storage
        .from("item-photos")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      photoUploaded = true;
      const result = await act("post", {
        circle_ids: audience,
        title,
        description,
        condition,
        category,
        custom_category:customCategory,
        pickup_area: area,
        pickup_style:pickupStyle,
        photo_path: path,
      });
      toast.success("Your item is live in your circle.");
      if (result.id) await navigate({ to: "/i/$id", params: { id: result.id } });
    } catch (e) {
      setNudge(false);
      setFailure(photoUploaded ? "Something went wrong on our side. Nothing you entered was lost." : "Your photo didn't upload. Try again or choose another photo.");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="flow-page live-form">
      <p className="eyebrow">PASS IT ON</p>
      <div className="post-progress"><span>{step} / 5</span><span>A new home starts here</span></div>
      <div className="step-indicators" role="progressbar" aria-label="Posting progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step}>{headings.map((heading,index)=><span key={heading} className={index<step?"done":""}/>)}</div>
      <h1>{headings[step-1]}</h1>
      {step===1 && <><p className="section-intro">A photo of your item, just as it is.</p><PhotoPicker image={image} onChange={setImage} /></>}
      {failure && <Failure message={failure} retry={() => { void publish(); }} />}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if(step<5)setStep(old=>old+1);else void review();
        }}
        className="grid gap-5 mt-6"
      >
        {step===2 && <><label className="form-label">
          Title
          <input
            required
            maxLength={80}
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
          Your own description (optional)
          <textarea
            maxLength={2000}
            rows={3}
            className="text-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        </>}
        {step===3 && <CategoryPicker categories={data.categories} value={category} onChange={setCategory} custom={customCategory} onCustomChange={setCustomCategory}/>}
        {step===4 && <>
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
        <fieldset className="grid gap-3"><legend className="form-label mb-3">Pickup style</legend><div className="flex flex-wrap gap-2">{PICKUP_STYLES.map(style=><Button key={style} type="button" variant={pickupStyle===style?"default":"outline"} aria-pressed={pickupStyle===style} onClick={()=>setPickupStyle(style)}>{style}</Button>)}</div></fieldset>
        <p className="section-intro">General area only. You choose whether to share an exact spot privately after a claim.</p></>}
        {step===5 && <><div className="post-preview"><img src={image} alt={title}/><div><h2>{title}</h2><p>{condition} · {pickupStyle} · {area}</p></div></div>
        <fieldset className="grid gap-3"><legend className="form-label mb-3">Who can see it?</legend>{data.circles.map(circle=><label className="flex gap-3 items-center" key={circle.id}><input type="checkbox" checked={audience.includes(circle.id)} onChange={e=>setAudience(old=>e.target.checked?[...old,circle.id]:old.filter(id=>id!==circle.id))}/>{circle.name}</label>)}{!audience.length&&<p role="alert">Choose at least one circle.</p>}</fieldset></>}
        <div className="flex gap-3">{step>1 && <Button type="button" variant="outline" disabled={busy||uploading} onClick={()=>setStep(old=>old-1)}>Back</Button>}<Button className="flex-1" type="submit" disabled={!ready[step-1] || busy || uploading}>{step===5?"Post":"Continue"}</Button></div>
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
