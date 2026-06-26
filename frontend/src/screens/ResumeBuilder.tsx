import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { Icon } from "../components/icons";
import { BackBar, Btn, Field, Loading, Phone, Screen, Status } from "../components/ui";

export function ResumeBuilder() {
  const nav = useNavigate();
  const { t, user, langPref, toast } = useSession();
  const [linkedin, setLinkedin] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [experience, setExperience] = useState("");
  const [target, setTarget] = useState("");
  const [resume, setResume] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!user) return;
    setBusy(true);
    try {
      const r = await api.aiResume({ user_id: user.id, lang: langPref, linkedin, phone, experience, target });
      setResume(r.resume);
    } catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }
  async function pdf() {
    if (!user) return;
    try { const sh = await api.createShare(user.id, {}); window.open(api.pdfUrl(sh.token), "_blank"); }
    catch (e) { toast((e as Error).message); }
  }

  return (
    <Phone>
      <Status />
      <BackBar to="/profile" />
      <Screen style={{ padding: "8px 24px 16px" }}>
        <div className="im-row" style={{ gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--grad-ik)" }}>
            <Icon name="spark" size={18} color="#fff" fill="#fff" width={0} /></div>
          <div><div className="im-q" style={{ fontSize: 22 }}>{t.rb.title}</div></div>
        </div>
        <div className="im-body" style={{ marginTop: 8 }}>{t.rb.sub}</div>

        {!resume ? <>
          <Field label={t.rb.target}><input className="im-input" placeholder={t.rb.target_ph} value={target} onChange={(e) => setTarget(e.target.value)} /></Field>
          <Field label={t.rb.exp}><textarea className="im-input" rows={4} style={{ resize: "none" }} placeholder={t.rb.exp_ph} value={experience} onChange={(e) => setExperience(e.target.value)} /></Field>
          <Field label={t.rb.linkedin}><input className="im-input" placeholder={t.rb.linkedin_ph} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} /></Field>
          <Field label={t.rb.phone}><input className="im-input" placeholder={t.rb.phone_ph} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Btn variant="primary" style={{ marginTop: 18 }} onClick={generate} disabled={busy}>{busy ? t.rb.building : `✨ ${t.rb.generate}`}</Btn>
        </> : <>
          {busy ? <Loading label={t.rb.building} /> : (
            <pre style={{ whiteSpace: "pre-wrap", font: "400 14px/1.6 var(--font-ui)", color: "var(--ink)", marginTop: 14,
              background: "var(--surface-sunk)", padding: 14, borderRadius: 12, maxHeight: 360, overflowY: "auto" }}>{resume}</pre>)}
          <div className="im-btn-row" style={{ marginTop: 14 }}>
            <Btn variant="ghost" grow onClick={generate} disabled={busy}>{t.rb.regen}</Btn>
            <Btn variant="primary" grow onClick={pdf}><span style={{ display: "inline-flex", gap: 7, alignItems: "center", justifyContent: "center" }}><Icon name="pdf" size={16} color="#fff" /> {t.rb.download}</span></Btn>
          </div>
        </>}
      </Screen>
    </Phone>
  );
}
