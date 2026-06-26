import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { l3 } from "../i18n";
import { Brandmark } from "../components/Brandmark";
import { Icon } from "../components/icons";
import { Btn, Field, Phone, Screen, Status } from "../components/ui";
import type { Meta } from "../types";

const AGES: { label: string; age: number }[] = [
  { label: "14–17", age: 16 }, { label: "18–22", age: 20 },
  { label: "23–27", age: 25 }, { label: "28–35", age: 31 },
];
const TOTAL = 10; // questionnaire steps after account

export function Register() {
  const nav = useNavigate();
  const { t, lang, langPref, login, toast } = useSession();
  const [step, setStep] = useState(0); // 0 = account, 1..10 = questions
  const [meta, setMeta] = useState<Meta | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [needs, setNeeds] = useState<string[]>([]);
  const [parents, setParents] = useState<boolean | null>(null);
  const [education, setEducation] = useState<string | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [tech, setTech] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [langs, setLangs] = useState<{ lang: string; level: string }[]>([]);
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.meta(age ?? undefined).then(setMeta).catch(() => {}); }, [age]);

  const techOptions = useMemo(() => {
    if (!meta) return [];
    const out: string[] = [];
    for (const d of meta.skill_domains) if (domains.includes(d.id)) for (const x of d.tech) if (!out.includes(x)) out.push(x);
    return out;
  }, [meta, domains]);

  function toggle<T>(list: T[], v: T, set: (x: T[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }
  function setLevel(langId: string, level: string) {
    setLangs((cur) => {
      const ex = cur.find((l) => l.lang === langId);
      if (!ex) return [...cur, { lang: langId, level }];
      return cur.map((l) => (l.lang === langId ? { ...l, level } : l));
    });
  }
  function toggleLang(langId: string) {
    setLangs((cur) => cur.some((l) => l.lang === langId)
      ? cur.filter((l) => l.lang !== langId)
      : [...cur, { lang: langId, level: "fluent" }]);
  }

  async function finish() {
    setBusy(true);
    try {
      const { token, user } = await api.register({
        full_name: name || null, email: email || null, password: pass || null,
        age, city, status, needs, is_migrant_child: parents === true,
        education, domains, bio: bio || null,
        skills: tech.map((n) => ({ name: n, verified: false })),
        languages: langs, consent_given: true, language_pref: langPref,
      });
      login(token, user);
      nav("/home");
    } catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }

  // validation per step
  const canNext = [
    !!(name && email && pass.length >= 6),
    !!status, !!age, !!city, needs.length > 0, parents !== null,
    !!education, true /*domains optional*/, true /*tech optional*/, true /*langs optional*/, true, /*bio optional*/
  ][step];

  function next() { if (step < TOTAL) setStep(step + 1); else finish(); }
  function back() { if (step === 0) nav("/"); else setStep(step - 1); }

  // ---- account step ----
  if (step === 0) {
    return (
      <Phone>
        <Status />
        <div className="hd"><button className="back" onClick={back}><Icon name="arrow" color="var(--ink)" /></button></div>
        <Screen style={{ padding: "8px 26px" }}>
          <Brandmark size={42} />
          <div className="im-q" style={{ fontSize: 26, marginTop: 14 }}>{t.su.title}</div>
          <div className="im-body" style={{ marginTop: 8 }}>{t.su.sub}</div>
          <Field label={t.su.name_l}><input className="im-input" placeholder={t.su.name_ph} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label={t.su.email_l}><input className="im-input" placeholder={t.su.email_ph} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label={t.su.pass_l}><input className="im-input" type="password" placeholder={t.su.pass_ph} value={pass} onChange={(e) => setPass(e.target.value)} /></Field>
        </Screen>
        <div className="foot">
          <Btn variant="primary" onClick={next} disabled={!canNext}>{t.su.create}</Btn>
          <div className="im-meta" style={{ textAlign: "center", lineHeight: 1.4 }}>{t.su.agree}</div>
        </div>
      </Phone>
    );
  }

  // ---- questionnaire shell ----
  const r = t.r;
  return (
    <Phone>
      <Status />
      <div className="hd">
        <button className="back" onClick={back}><Icon name="arrow" color="var(--ink)" /></button>
        <div className="im-progress" style={{ margin: "0 4px" }}><i style={{ width: `${(step / TOTAL) * 100}%` }} /></div>
      </div>
      <Screen style={{ padding: "30px 26px 10px" }}>
        <div className="im-step">{r.step} {step} / {TOTAL}</div>

        {step === 1 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.status_q}</div>
          <div className="im-meta" style={{ marginTop: 6 }}>{r.status_hint}</div>
          <div className="listgap" style={{ marginTop: 22 }}>
            {meta?.statuses.map((o) => {
              const on = status === o.id;
              return (
                <button key={o.id} className={`im-option ${on ? "is-on" : ""}`}
                  style={{ flexDirection: "row", alignItems: "center", gap: 13 }} onClick={() => setStatus(o.id)}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: on ? "var(--teal)" : "var(--surface-tint)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={o.icon} size={20} color={on ? "#fff" : "var(--teal)"} />
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ font: "600 15px var(--font-ui)", color: "var(--ink)" }}>{l3(lang, o.label)}</div>
                    <div className="im-meta" style={{ marginTop: 2 }}>{l3(lang, o.sub)}</div>
                  </div>
                  {on && <span className="badge" style={{ position: "static", opacity: 1 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </>}

        {step === 2 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.age_q}</div>
          <div className="im-grid-2" style={{ marginTop: 26 }}>
            {AGES.map((a) => (
              <button key={a.label} className="im-btn im-btn--ghost" onClick={() => setAge(a.age)}
                style={{ padding: "22px 0", fontSize: 19, color: "var(--ink)",
                  ...(age === a.age ? { borderColor: "var(--teal)", background: "var(--surface-tint)" } : {}) }}>
                {a.label}
              </button>
            ))}
          </div>
        </>}

        {step === 3 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.city_q}</div>
          <div className="listgap" style={{ marginTop: 24 }}>
            {(meta?.cities || []).filter((c) => c !== "all").map((c) => (
              <button key={c} className="im-btn im-btn--ghost" onClick={() => setCity(c)}
                style={{ textAlign: "left", color: "var(--ink)",
                  ...(city === c ? { borderColor: "var(--teal)", background: "var(--surface-tint)" } : {}) }}>{c}</button>
            ))}
          </div>
        </>}

        {step === 4 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.need_q}</div>
          <div className="im-meta" style={{ marginTop: 6 }}>{r.need_hint}</div>
          <div className="im-grid-2" style={{ marginTop: 22 }}>
            {(meta?.needs || []).map((o) => {
              const on = needs.includes(o.id);
              return (
                <button key={o.id} className={`im-option ${on ? "is-on" : ""}`} onClick={() => toggle(needs, o.id, setNeeds)}>
                  <Icon name={o.icon_id || "spark"} color={on ? "var(--teal)" : "var(--ink)"} />
                  <span style={{ font: "600 14px var(--font-ui)" }}>{lang === "tg" ? o.label.tj : o.label.ru}</span>
                  <span className="badge">✓</span>
                </button>
              );
            })}
          </div>
        </>}

        {step === 5 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.parents_q}</div>
          <div className="im-body" style={{ marginTop: 8 }}>{r.parents_sub}</div>
          <div className="im-grid-2" style={{ marginTop: 26 }}>
            {[{ v: true, l: lang === "en" ? "Yes" : lang === "tg" ? "Ҳа" : "Да" },
              { v: false, l: lang === "en" ? "No" : lang === "tg" ? "Не" : "Нет" }].map((o) => (
              <button key={String(o.v)} className="im-btn im-btn--ghost" onClick={() => setParents(o.v)}
                style={{ padding: "22px 0", color: "var(--ink)",
                  ...(parents === o.v ? { borderColor: "var(--teal)", background: "var(--surface-tint)" } : {}) }}>{o.l}</button>
            ))}
          </div>
        </>}

        {step === 6 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.edu_q}</div>
          <div className="listgap" style={{ marginTop: 24 }}>
            {(meta?.education_levels || []).map((e) => (
              <button key={e.id} className="im-btn im-btn--ghost" onClick={() => setEducation(e.id)}
                style={{ textAlign: "left", color: "var(--ink)",
                  ...(education === e.id ? { borderColor: "var(--teal)", background: "var(--surface-tint)" } : {}) }}>
                {l3(lang, e.label)}</button>
            ))}
          </div>
        </>}

        {step === 7 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.domains_q}</div>
          <div className="im-meta" style={{ marginTop: 6 }}>{r.domains_hint}</div>
          <div className="im-grid-2" style={{ marginTop: 22 }}>
            {(meta?.skill_domains || []).map((d) => {
              const on = domains.includes(d.id);
              return (
                <button key={d.id} className={`im-option ${on ? "is-on" : ""}`} onClick={() => toggle(domains, d.id, setDomains)}>
                  <Icon name={d.icon} color={on ? "var(--teal)" : "var(--ink)"} />
                  <span style={{ font: "600 14px var(--font-ui)" }}>{l3(lang, d.label)}</span>
                  <span className="badge">✓</span>
                </button>
              );
            })}
          </div>
        </>}

        {step === 8 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.tech_q}</div>
          <div className="im-meta" style={{ marginTop: 6 }}>{r.tech_hint}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 20 }}>
            {techOptions.map((x) => {
              const on = tech.includes(x);
              return <span key={x} className={`im-chip ${on ? "im-chip--on" : ""}`} style={{ cursor: "pointer" }}
                onClick={() => toggle(tech, x, setTech)}>{x} {on ? <span className="tick">✓</span> : "+"}</span>;
            })}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <input className="im-input" placeholder={r.tech_add} value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && techInput.trim()) { setTech([...tech, techInput.trim()]); setTechInput(""); } }} />
            <Btn variant="outline" sm style={{ width: "auto", padding: "0 16px" }}
              onClick={() => { if (techInput.trim()) { setTech([...tech, techInput.trim()]); setTechInput(""); } }}>{t.c.add}</Btn>
          </div>
          {tech.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {tech.map((x, i) => <span key={i} className="im-chip im-chip--on" style={{ cursor: "pointer" }}
              onClick={() => setTech(tech.filter((_, j) => j !== i))}>{x} ✕</span>)}
          </div>}
        </>}

        {step === 9 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.langs_q}</div>
          <div className="im-meta" style={{ marginTop: 6 }}>{r.langs_hint}</div>
          <div className="listgap" style={{ marginTop: 20 }}>
            {(meta?.spoken_languages || []).map((lg) => {
              const sel = langs.find((l) => l.lang === lg.id);
              return (
                <div key={lg.id} className={`im-card ${sel ? "im-card--tint" : ""}`} style={{ padding: 12 }}>
                  <div className="im-spread">
                    <button onClick={() => toggleLang(lg.id)} style={{ background: "none", border: "none", cursor: "pointer",
                      font: "600 15px var(--font-ui)", color: sel ? "var(--teal)" : "var(--ink)", display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ width: 18, height: 18, borderRadius: 6, border: `2px solid ${sel ? "var(--teal)" : "var(--line-input)"}`,
                        background: sel ? "var(--teal)" : "transparent", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px var(--font-ui)" }}>{sel ? "✓" : ""}</span>
                      {l3(lang, lg.label)}
                    </button>
                  </div>
                  {sel && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {(meta?.lang_levels || []).map((lv) => (
                      <button key={lv.id} className={`im-filter ${sel.level === lv.id ? "is-on" : ""}`}
                        onClick={() => setLevel(lg.id, lv.id)}>{l3(lang, lv.label)}</button>
                    ))}
                  </div>}
                </div>
              );
            })}
          </div>
        </>}

        {step === 10 && <>
          <div className="im-q" style={{ marginTop: 14 }}>{r.bio_q}</div>
          <div className="im-meta" style={{ marginTop: 6 }}>{r.bio_hint}</div>
          <textarea className="im-input" rows={4} style={{ marginTop: 18, resize: "none" }}
            placeholder={r.bio_ph} value={bio} onChange={(e) => setBio(e.target.value)} />
          <Btn variant="ghost" sm style={{ marginTop: 10, width: "auto" }} disabled={busy || !bio.trim()}
            onClick={async () => {
              setBusy(true);
              try { const { text } = await api.aiImprove(bio, "bio", langPref); if (text) setBio(text); }
              catch (e) { toast((e as Error).message); } finally { setBusy(false); }
            }}>✨ {t.c.improve}</Btn>
        </>}
      </Screen>
      <div className="foot">
        <div className="im-btn-row">
          <Btn variant="ghost" onClick={back}>{t.c.back}</Btn>
          <Btn variant="primary" grow onClick={next} disabled={!canNext || busy}>
            {step < TOTAL ? t.c.next : t.r.go}
          </Btn>
        </div>
      </div>
    </Phone>
  );
}
