import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { BackBar, Btn, Field, Phone, Screen, Status } from "../components/ui";

export function CreateGig() {
  const nav = useNavigate();
  const { t, langPref, toast } = useSession();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  async function aiDescribe() {
    if (!title.trim()) { toast(t.gig.name_l); return; }
    setAiBusy(true);
    try {
      const seed = desc.trim() || title;
      const { text } = desc.trim()
        ? await api.aiImprove(seed, "gig", langPref)
        : await api.aiText(`Опиши фриланс-услугу: "${title}". 2-3 предложения, продающе.`, langPref);
      if (text) setDesc(text);
    } catch (e) { toast((e as Error).message || t.x.error); } finally { setAiBusy(false); }
  }

  async function publish() {
    setBusy(true);
    try {
      await api.createGig({ title, category: category || null, price: price ? Number(price) : null,
        delivery_days: days ? Number(days) : null, description: desc });
      toast(t.gig.published); nav("/work");
    } catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }

  return (
    <Phone>
      <Status />
      <BackBar to="/work" />
      <Screen style={{ padding: "8px 26px" }}>
        <div className="im-q" style={{ fontSize: 24, marginTop: 12 }}>{t.gig.title}</div>
        <Field label={t.gig.name_l}><input className="im-input" placeholder={t.gig.name_ph} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label={t.gig.cat_l}><input className="im-input" placeholder="design / it / video" value={category} onChange={(e) => setCategory(e.target.value)} /></Field>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Field label={t.gig.price_l}><input className="im-input" type="number" placeholder={t.gig.price_ph} value={price} onChange={(e) => setPrice(e.target.value)} /></Field></div>
          <div style={{ flex: 1 }}><Field label={t.gig.term_l}><input className="im-input" placeholder={t.gig.term_ph} value={days} onChange={(e) => setDays(e.target.value)} /></Field></div>
        </div>
        <Field label={t.gig.desc_l}><textarea className="im-input" rows={4} style={{ resize: "none" }} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <Btn variant="ghost" sm style={{ width: "auto" }} onClick={aiDescribe} disabled={aiBusy}>✨ {aiBusy ? t.c.improving : t.gig.ai}</Btn>
      </Screen>
      <div className="foot">
        <Btn variant="primary" onClick={publish} disabled={busy || !title.trim()}>{t.gig.publish}</Btn>
      </div>
    </Phone>
  );
}
