import { useEffect, useState } from "react";
import { api } from "../api";
import { useSession } from "../store";
import { AppScreen } from "../components/Shell";
import { Logo } from "../components/icons";
import { Loading } from "../components/ui";
import type { University } from "../types";

export function Universities() {
  const { t } = useSession();
  const [unis, setUnis] = useState<University[] | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [schOnly, setSchOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => { api.universities().then((r) => setUnis(r.universities)).catch(() => setUnis([])); }, []);

  const cities = Array.from(new Set((unis || []).map((u) => u.city).filter(Boolean))) as string[];
  let list = unis || [];
  if (city) list = list.filter((u) => u.city === city);
  if (schOnly) list = list.filter((u) => u.programs.some((p) => p.scholarship));

  return (
    <AppScreen>
      <div className="im-title" style={{ fontSize: 24, padding: "18px 0 12px" }}>{t.uni.title}</div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8 }}>
        <button className={`im-filter ${!city ? "is-on" : ""}`} onClick={() => setCity(null)}>{t.uni.filt_city}: {t.h.all}</button>
        {cities.map((c) => <button key={c} className={`im-filter ${city === c ? "is-on" : ""}`} onClick={() => setCity(c)}>{c}</button>)}
        <button className={`im-filter ${schOnly ? "is-on" : ""}`} onClick={() => setSchOnly(!schOnly)}>{t.uni.filt_sch}</button>
      </div>

      {unis === null ? <Loading /> : list.map((u) => (
        <div key={u.id} className="im-card im-job" style={{ marginBottom: 11 }} onClick={() => setOpen(open === u.id ? null : u.id)}>
          <div className="im-row" style={{ gap: 12 }}>
            <Logo name={u.name} size={44} />
            <div style={{ flex: 1 }}><div className="im-title" style={{ fontSize: 15 }}>{u.name}</div>
              <div className="im-meta" style={{ marginTop: 2 }}>{u.city} · {u.programs.length}</div></div>
          </div>
          {open === u.id && <div className="listgap" style={{ marginTop: 12 }}>
            {u.programs.map((p, i) => (
              <div key={i} className="im-card im-card--sunk" style={{ padding: 11 }}>
                <div style={{ font: "600 14px var(--font-ui)", color: "var(--ink)" }}>{p.name}
                  {p.scholarship && <span style={{ color: "var(--teal)" }}> · 🎓 {t.uni.sch}</span>}</div>
                <div className="im-meta" style={{ marginTop: 4 }}>{t.uni.score}: {p.min_score ?? "—"} · {t.uni.cost}: {p.cost ?? "—"} · {t.uni.deadline}: {p.deadline ?? "—"}</div>
              </div>))}
            {u.requirements && <div className="im-meta">{u.requirements}</div>}
          </div>}
        </div>
      ))}
    </AppScreen>
  );
}
