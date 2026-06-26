import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { l3 } from "../i18n";
import { AppScreen } from "../components/Shell";
import { Icon, Logo } from "../components/icons";
import { Btn, Loading, Sheet } from "../components/ui";
import { useCountUp } from "../hooks";
import type { Achievement, Meta, RoadmapSteps, User } from "../types";

export function Profile() {
  const nav = useNavigate();
  const { t, lang, langPref, user, refresh, toast } = useSession();
  const [full, setFull] = useState<User | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapSteps | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const trustN = useCountUp(full?.trust_score ?? user?.trust_score ?? 0);

  useEffect(() => {
    refresh();
    if (!user) return;
    api.me().then(setFull).catch(() => {});
    api.userRoadmaps(user.id).then((r) => setRoadmap(r.roadmaps[0] || null)).catch(() => {});
    api.meta().then(setMeta).catch(() => {});
    // eslint-disable-next-line
  }, []);

  if (!user || !full) return <AppScreen><Loading /></AppScreen>;
  const achs: Achievement[] = full.achievements || [];
  const verified = achs.filter((a) => a.verified);
  const initials = (full.full_name || "И").trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const domLabel = (id: string) => { const d = meta?.skill_domains.find((x) => x.id === id); return d ? l3(lang, d.label) : id; };
  const langLabel = (id: string) => { const l = meta?.spoken_languages.find((x) => x.id === id); return l ? l3(lang, l.label) : id; };
  const lvlLabel = (id: string) => { const l = meta?.lang_levels.find((x) => x.id === id); return l ? l3(lang, l.label) : id; };
  const eduLabel = full.education ? (meta?.education_levels.find((e) => e.id === full.education)?.label) : null;

  async function genResume() {
    setBusy(true); setResumeOpen(true);
    try { const r = await api.aiResume({ user_id: user!.id, lang: langPref }); setResume(r.resume); }
    catch (e) { toast((e as Error).message); setResume(t.x.error); } finally { setBusy(false); }
  }
  async function improveResume() {
    if (!resume) return;
    setBusy(true);
    try { const r = await api.aiImprove(resume, "resume", langPref); setResume(r.text); }
    catch (e) { toast((e as Error).message); } finally { setBusy(false); }
  }
  async function pdf() {
    try { const sh = await api.createShare(user!.id, {}); window.open(api.pdfUrl(sh.token), "_blank"); }
    catch (e) { toast((e as Error).message); }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginTop: 18 }}><div className="im-section">{title}</div><div style={{ marginTop: 9 }}>{children}</div></div>
  );

  return (
    <AppScreen>
      {/* résumé header */}
      <div className="im-card" style={{ marginTop: 16, padding: 18, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 130, height: 130, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,91,214,.14), transparent 70%)" }} />
        <div className="im-row" style={{ gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--teal)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", font: "800 24px var(--font-head)", boxShadow: "var(--sh-node)" }}>
            {initials}</div>
          <div style={{ flex: 1 }}>
            <div className="im-h1" style={{ fontSize: 22 }}>{full.full_name || "—"}</div>
            <div className="im-meta" style={{ marginTop: 2 }}>{full.city}{eduLabel ? ` · ${l3(lang, eduLabel)}` : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="back im-press" onClick={() => nav("/share")} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Icon name="send" size={20} color="var(--teal)" /></button>
            <button className="back im-press" onClick={() => nav("/settings")} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Icon name="filter" size={20} color="var(--muted)" /></button>
          </div>
        </div>
        {full.bio && <p className="im-body" style={{ marginTop: 12 }}>{full.bio}</p>}
        {/* trust strip */}
        <div className="im-row" style={{ gap: 14, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <div><span className="im-trust" style={{ fontSize: 30 }}>{trustN}</span></div>
          <div><div className="im-trust-cap">{t.pr.trust}</div><div className="im-meta" style={{ marginTop: 2 }}>{t.pr.trust_sub}</div></div>
        </div>
      </div>

      {/* fields / domains */}
      {full.domains && full.domains.length > 0 && (
        <Section title={t.pr.domains_l}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {full.domains.map((d) => <span key={d} className="im-chip im-chip--on">{domLabel(d)}</span>)}</div>
        </Section>
      )}

      {/* skills */}
      {full.skills?.length > 0 && (
        <Section title={t.pr.skills}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {full.skills.map((s, i) => <span key={i} className="im-chip">{s.name}{s.verified ? <span className="tick"> ✓</span> : ""}</span>)}</div>
        </Section>
      )}

      {/* languages */}
      {full.languages?.length > 0 && (
        <Section title={t.pr.langs}>
          <div className="listgap">
            {full.languages.map((l, i) => (
              <div key={i} className="im-spread im-card im-card--sunk" style={{ padding: "10px 13px" }}>
                <span style={{ font: "600 14px var(--font-ui)", color: "var(--ink)" }}>{langLabel(l.lang)}</span>
                <span className="im-meta">{lvlLabel(l.level)}</span></div>
            ))}</div>
        </Section>
      )}

      {/* verified experience */}
      <Section title={t.pr.verified}>
        {verified.length === 0
          ? <div className="im-card im-card--sunk im-meta">{t.x.nothing}</div>
          : <div className="listgap">{verified.map((a) => (
              <div key={a.id} className="im-card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Logo name={a.verified_by} size={40} />
                <div style={{ flex: 1 }}><div style={{ font: "600 14px var(--font-ui)", color: "var(--ink)" }}>{a.title}</div>
                  <div className="im-meta" style={{ marginTop: 2 }}>{t.pr.by} {a.verified_by} ✓</div></div>
              </div>))}</div>}
      </Section>

      {/* mini path */}
      {roadmap && (
        <Section title={t.pr.mini}>
          <button className="im-card im-job" style={{ width: "100%", textAlign: "left", cursor: "pointer" }} onClick={() => nav("/path")}>
            <div style={{ font: "600 15px var(--font-ui)", color: "var(--ink)" }}>{roadmap.goal}</div>
            <div className="im-progress" style={{ marginTop: 9 }}><i style={{ width: `${(roadmap.progress.done / Math.max(1, roadmap.progress.total)) * 100}%` }} /></div>
            <div className="im-meta" style={{ marginTop: 7 }}>{roadmap.progress.label}</div>
          </button>
        </Section>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
        <Btn variant="primary" onClick={() => nav("/resume-builder")}>✨ {t.rb.title}</Btn>
        <div className="im-btn-row">
          <Btn variant="outline" grow onClick={genResume}>{t.pr.resume_ai}</Btn>
          <Btn variant="outline" grow onClick={() => nav("/share")}>{t.pr.share}</Btn>
        </div>
        <Btn variant="ghost" onClick={() => nav("/path")}>{t.pr.add}</Btn>
      </div>

      <Sheet open={resumeOpen} onClose={() => setResumeOpen(false)}>
        <div className="im-title" style={{ fontSize: 18 }}>{t.pr.resume_ai}</div>
        {busy && !resume ? <Loading label={t.p.building} /> : (
          <pre style={{ whiteSpace: "pre-wrap", font: "400 14px/1.6 var(--font-ui)", color: "var(--ink)",
            marginTop: 12, background: "var(--surface-sunk)", padding: 14, borderRadius: 12, maxHeight: 340, overflowY: "auto" }}>
            {resume}</pre>)}
        <div className="im-btn-row" style={{ marginTop: 14 }}>
          <Btn variant="ghost" grow onClick={improveResume} disabled={busy || !resume}>✨ {busy ? t.c.improving : t.c.improve}</Btn>
          <Btn variant="primary" grow onClick={pdf}>{t.pr.pdf}</Btn>
        </div>
      </Sheet>
    </AppScreen>
  );
}
