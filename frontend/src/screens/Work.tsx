import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { AppScreen } from "../components/Shell";
import { Icon, Logo } from "../components/icons";
import { Btn, Empty, Loading, Sheet } from "../components/ui";
import { cleanLocations } from "../hooks";
import type { Application, Company, Gig, Meta, Vacancy } from "../types";

type Tab = "jobs" | "interns" | "free" | "companies" | "apps";
interface Filters { city?: string; sphere?: string; employment_format?: string; experience?: string; salary_min?: number; q?: string; }

export function Work() {
  const nav = useNavigate();
  const { t, user, toast } = useSession();
  const [tab, setTab] = useState<Tab>("jobs");
  const [vac, setVac] = useState<Vacancy[] | null>(null);
  const [spheres, setSpheres] = useState<string[]>([]);
  const [gigs, setGigs] = useState<Gig[] | null>(null);
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [apps, setApps] = useState<Application[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => { api.meta().then(setMeta).catch(() => {}); }, []);

  const loadVac = (category: "employment" | "internship") => {
    setVac(null);
    api.vacancies({ ...filters, q, category }).then((r) => { setVac(r.vacancies); setSpheres(r.spheres); }).catch(() => setVac([]));
  };

  useEffect(() => {
    if (!user?.is_adult) return;
    if (tab === "jobs") loadVac("employment");
    else if (tab === "interns") loadVac("internship");
    else if (tab === "free" && !gigs) api.gigs().then((r) => setGigs(r.gigs)).catch(() => setGigs([]));
    else if (tab === "companies" && !companies) api.companies().then((r) => setCompanies(r.companies)).catch(() => setCompanies([]));
    else if (tab === "apps") api.myApplications(user.id).then((r) => setApps(r.applications)).catch(() => setApps([]));
    // eslint-disable-next-line
  }, [tab, user, filters, q]);

  async function applyTo(body: Record<string, unknown>) {
    try { await api.apply(body); toast(t.wk.taken); } catch (e) { toast((e as Error).message || t.x.error); }
  }

  if (!user?.is_adult) return (
    <AppScreen>
      <div style={{ padding: "60px 12px", textAlign: "center" }}>
        <div className="im-node im-node--goal" style={{ width: 56, height: 56, margin: "0 auto", animation: "none" }}><Icon name="lock" size={24} color="#fff" /></div>
        <div className="im-body" style={{ marginTop: 16 }}>{t.wk.minor}</div>
      </div>
    </AppScreen>
  );

  const tabs: { k: Tab; label: string }[] = [
    { k: "jobs", label: t.wk.tab0 }, { k: "interns", label: t.wk.tab1 },
    { k: "free", label: t.wk.tab2 }, { k: "companies", label: t.wk.tab3 }, { k: "apps", label: t.wk.apps },
  ];
  const expL = (e?: string | null) => e ? (t.flt as Record<string, string>)[`exp_${e}`] || e : null;
  const fmtL = (f?: string | null) => f ? (t.flt as Record<string, string>)[`fmt_${f}`] || f : null;
  const activeCount = Object.values(filters).filter((x) => x !== undefined && x !== "").length;
  const showFilters = tab === "jobs" || tab === "interns";

  const VacCard = ({ v }: { v: Vacancy }) => {
    const salary = (v.salary_min || v.salary_max)
      ? `${v.salary_min ?? ""}${v.salary_min && v.salary_max ? "–" : ""}${v.salary_max ?? ""} ${t.vac.month}` : t.vac.no_salary;
    return (
      <button className="im-card im-job im-lift" style={{ width: "100%", textAlign: "left", marginBottom: 11 }}
        onClick={() => nav(`/vacancy/${v.id}`)}>
        <div className="im-row" style={{ gap: 12, alignItems: "flex-start" }}>
          <Logo name={v.organization} size={46} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="im-title" style={{ fontSize: 15 }}>{v.title}</div>
            <div className="im-meta" style={{ marginTop: 2 }}>{v.organization}</div>
            <div className="im-salary" style={{ marginTop: 7 }}>{salary}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {expL(v.experience) && <span className="im-tag">{expL(v.experience)}</span>}
              {fmtL(v.employment_format) && <span className="im-tag">{fmtL(v.employment_format)}</span>}
              {cleanLocations(v.location).slice(0, 1).map((c) => <span key={c} className="im-tag">{c}</span>)}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <AppScreen>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0 12px" }}>
        <div className="im-title" style={{ fontSize: 24 }}>{t.wk.title}</div>
        <Btn variant="dark" sm style={{ width: "auto" }} onClick={() => nav("/work/create")}>+ {t.wk.create}</Btn>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12 }}>
        {tabs.map((tb) => <button key={tb.k} className={`im-filter ${tab === tb.k ? "is-on" : ""}`} onClick={() => setTab(tb.k)}>{tb.label}</button>)}
      </div>

      {showFilters && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input className="im-input" style={{ flex: 1, padding: 11 }} placeholder={t.flt.search} value={q}
            onChange={(e) => setQ(e.target.value)} />
          <button className="im-filter" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => setFilterOpen(true)}>
            <Icon name="filter" size={15} color="var(--ink)" />{t.flt.title}{activeCount ? ` · ${activeCount}` : ""}
          </button>
        </div>
      )}

      {tab === "jobs" && (vac === null ? <Loading /> : vac.length === 0 ? <Empty /> : <div className="im-list">{vac.map((v) => <VacCard key={v.id} v={v} />)}</div>)}
      {tab === "interns" && (vac === null ? <Loading /> : vac.length === 0 ? <Empty /> : <div className="im-list">{vac.map((v) => <VacCard key={v.id} v={v} />)}</div>)}

      {tab === "free" && (gigs === null ? <Loading /> : gigs.length === 0 ? <Empty /> : <div className="im-list">{gigs.map((g) => (
        <div key={g.id} className="im-card im-job" style={{ marginBottom: 11 }}>
          <div className="im-title" style={{ fontSize: 15 }}>{g.title}</div>
          <div className="im-meta" style={{ marginTop: 3 }}>{g.category}{g.price ? ` · ${g.price} ${t.wk.cur}` : ""}{g.delivery_days ? ` · ${g.delivery_days} ${t.h.d}` : ""}</div>
          <Btn variant="outline" sm style={{ marginTop: 10, width: "100%" }} onClick={() => applyTo({ gig_id: g.id })}>{t.wk.apply}</Btn>
        </div>))}</div>)}

      {tab === "companies" && (companies === null ? <Loading /> : companies.length === 0 ? <Empty /> : <div className="im-list">{companies.map((c) => (
        <div key={c.id} className="im-card" style={{ marginBottom: 11 }}>
          <div className="im-row" style={{ gap: 12 }}>
            <Logo name={c.name} size={48} color={c.brand_color} text={c.logo_text} />
            <div style={{ flex: 1 }}><div className="im-title" style={{ fontSize: 16 }}>{c.name}{c.verified ? " ✓" : ""}</div>
              <div className="im-meta" style={{ marginTop: 2 }}>{c.sphere} · {c.vacancies.length} {t.wk.vacancies}</div></div>
          </div>
          {c.vacancies.length > 0 && <div className="listgap" style={{ marginTop: 12 }}>
            {c.vacancies.map((v) => (
              <button key={v.id} className="im-card im-card--sunk im-spread im-press" style={{ padding: "10px 13px", width: "100%", textAlign: "left", border: "1px solid var(--line)" }}
                onClick={() => nav(`/vacancy/${v.id}`)}>
                <div><div style={{ font: "600 14px var(--font-ui)", color: "var(--ink)" }}>{v.title}</div>
                  <div className="im-salary" style={{ fontSize: 13, marginTop: 2 }}>{(v.salary_min || v.salary_max) ? `${v.salary_min ?? ""}–${v.salary_max ?? ""}` : ""}</div></div>
                <Icon name="chev" size={18} color="var(--muted)" />
              </button>))}</div>}
        </div>))}</div>)}

      {tab === "apps" && (apps === null ? <Loading /> : apps.length === 0 ? <Empty /> : <div className="im-list">{apps.map((a) => {
        const idx = ["sent", "viewed", "shortlisted", "accepted", "rejected"].indexOf(a.status);
        const stKey = ["sent", "seen", "short", "accepted", "rejected"][idx < 0 ? 0 : idx];
        return (
          <div key={a.id} className="im-card im-spread" style={{ marginBottom: 10 }}>
            <span style={{ font: "600 14px var(--font-ui)", color: "var(--ink)" }}>{a.title || "—"}</span>
            <span className="im-status" data-st={stKey}>{t.ap.st[idx < 0 ? 0 : idx]}</span>
          </div>);
      })}</div>)}

      {/* filter sheet */}
      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)}>
        <div className="im-spread"><div className="im-title" style={{ fontSize: 18 }}>{t.flt.title}</div>
          <button onClick={() => setFilters({})} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", font: "600 13px var(--font-ui)" }}>{t.flt.reset}</button></div>

        <FilterRow label={t.flt.city} value={filters.city} options={(meta?.cities || []).filter((c) => c !== "all")}
          onPick={(v) => setFilters((f) => ({ ...f, city: f.city === v ? undefined : v }))} />
        <FilterRow label={t.flt.sphere} value={filters.sphere} options={spheres.length ? spheres : (meta?.categories || [])}
          onPick={(v) => setFilters((f) => ({ ...f, sphere: f.sphere === v ? undefined : v }))} />
        <FilterRow label={t.flt.format} value={filters.employment_format}
          options={["office", "remote", "hybrid"]} labelMap={(o) => (t.flt as Record<string, string>)[`fmt_${o}`]}
          onPick={(v) => setFilters((f) => ({ ...f, employment_format: f.employment_format === v ? undefined : v }))} />
        <FilterRow label={t.flt.exp} value={filters.experience}
          options={["none", "junior", "middle", "senior"]} labelMap={(o) => (t.flt as Record<string, string>)[`exp_${o}`]}
          onPick={(v) => setFilters((f) => ({ ...f, experience: f.experience === v ? undefined : v }))} />
        <FilterRow label={t.flt.salary} value={filters.salary_min ? String(filters.salary_min) : undefined}
          options={["2000", "3000", "4000", "5000"]} labelMap={(o) => `${o}+`}
          onPick={(v) => setFilters((f) => ({ ...f, salary_min: f.salary_min === +v ? undefined : +v }))} />

        <Btn variant="primary" style={{ marginTop: 18 }} onClick={() => setFilterOpen(false)}>{t.flt.apply}</Btn>
      </Sheet>
    </AppScreen>
  );
}

function FilterRow({ label, value, options, onPick, labelMap }:
  { label: string; value?: string; options: string[]; onPick: (v: string) => void; labelMap?: (o: string) => string }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div className="im-label">{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {options.map((o) => (
          <button key={o} className={`im-filter ${value === o ? "is-on" : ""}`} onClick={() => onPick(o)}>{labelMap ? labelMap(o) : o}</button>
        ))}
      </div>
    </div>
  );
}
