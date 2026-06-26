import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { AppScreen } from "../components/Shell";
import { OppCard } from "../components/OppCard";
import { Icon } from "../components/icons";
import { Chevron, Empty, LangPills, Loading } from "../components/ui";
import { useCountUp } from "../hooks";
import type { Opportunity, RoadmapSteps } from "../types";

const FILTER_CATS = [null, ["education", "grant"], ["vocational"], ["employment", "internship"]];

export function Home() {
  const nav = useNavigate();
  const { t, user } = useSession();
  const [all, setAll] = useState<Opportunity[] | null>(null);
  const [limit, setLimit] = useState(12);
  const [filter, setFilter] = useState(0);
  const [roadmap, setRoadmap] = useState<RoadmapSteps | null>(null);
  const [apps, setApps] = useState(0);

  useEffect(() => {
    if (!user) return;
    api.matches(user.id, 40).then((r) => setAll(r.matches)).catch(() => setAll([]));
    api.userRoadmaps(user.id).then((r) => setRoadmap(r.roadmaps[0] || null)).catch(() => {});
    api.myApplications(user.id).then((r) => setApps(r.applications.length)).catch(() => {});
  }, [user]);

  const cats = FILTER_CATS[filter];
  const list = (all || []).filter((o) => !cats || cats.includes(o.category)).slice(0, limit);
  const cur = roadmap?.steps.find((s) => s.status === "current");
  const trustN = useCountUp(user?.trust_score ?? 0);
  const doneN = useCountUp(roadmap?.progress.done ?? 0);
  const appsN = useCountUp(apps);

  return (
    <AppScreen>
      <div style={{ paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="im-meta">{t.h.hello},</div>
          <div className="im-title" style={{ fontSize: 22 }}>{user?.full_name?.split(" ")[0] || "👋"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="back" onClick={() => nav("/notifications")} style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="bell" color="var(--ink)" />
            <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 99, background: "var(--terra)" }} />
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}><LangPills /></div>

      {/* AI hero */}
      <div className="ai-hero" style={{ marginTop: 14 }} onClick={() => nav("/ai")}>
        <div className="im-row" style={{ gap: 10 }}>
          <div className="avatar imkon-float" style={{ background: "var(--grad-hero)" }}><Icon name="spark" size={20} color="#fff" fill="#fff" width={0} /></div>
          <div>
            <div style={{ font: "600 14px var(--font-ui)", color: "var(--ink)" }}>{t.h.ai_name}</div>
            <div className="im-meta" style={{ color: "var(--teal)", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: 9, background: "var(--teal)" }} />{t.ai.online}</div>
          </div>
        </div>
        <div className="ai-hero-q">{t.h.ai_hero_q}</div>
        <div className="ai-ask"><span className="ph">{t.h.ai_ask}</span>
          <span className="go"><Icon name="send" size={17} color="#fff" fill="#fff" width={0} /></span></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 11 }}>
          {[["cap", t.h.q_scholar], ["path", t.h.q_path], ["work", t.h.q_job]].map(([ic, lbl]) => (
            <span key={lbl} className="im-chip" style={{ cursor: "pointer" }}>
              <Icon name={ic} size={15} color="var(--teal)" /> {lbl}</span>
          ))}
        </div>
      </div>

      {/* continue path */}
      <div className="im-card im-job" style={{ marginTop: 14, cursor: "pointer" }} onClick={() => nav("/path")}>
        {roadmap ? <>
          <div className="im-spread"><span className="im-step" style={{ color: "var(--terra)" }}>{t.h.cont_t}</span>
            {cur && <span className="im-here">{t.p.here}</span>}</div>
          <div className="im-title" style={{ fontSize: 16, marginTop: 9 }}>{cur ? cur.label : roadmap.goal}</div>
          <div className="im-progress" style={{ marginTop: 11 }}>
            <i style={{ width: `${(roadmap.progress.done / Math.max(1, roadmap.progress.total)) * 100}%` }} /></div>
          <div className="im-spread" style={{ marginTop: 10 }}>
            <span className="im-meta">{roadmap.progress.done}/{roadmap.progress.total}</span>
            <span style={{ font: "600 13px var(--font-ui)", color: "var(--teal)", display: "flex", alignItems: "center", gap: 4 }}>
              {t.h.cont_cta} <Chevron color="var(--teal)" /></span>
          </div>
        </> : <div className="im-row">
          <div className="im-node im-node--goal" style={{ width: 40, height: 40, animation: "none" }}><Icon name="flag" size={18} color="#fff" /></div>
          <div style={{ flex: 1 }}><div style={{ font: "600 15px var(--font-head)", color: "var(--ink)" }}>{t.p.empty_t}</div>
            <div className="im-meta" style={{ marginTop: 2 }}>{t.p.build}</div></div>
          <Chevron />
        </div>}
      </div>

      {/* stats */}
      <div style={{ marginTop: 14, display: "flex", gap: 10 }} className="im-list">
        <div className="stat im-lift"><div className="n" style={{ color: "var(--teal)" }}>{trustN}</div><div className="l">{t.h.trust}</div></div>
        <div className="stat im-lift"><div className="n" style={{ color: "var(--gold)" }}>{roadmap ? `${doneN}/${roadmap.progress.total}` : "—"}</div><div className="l">{t.h.steps_l}</div></div>
        <div className="stat im-lift"><div className="n" style={{ color: "var(--orange-deep)" }}>{appsN}</div><div className="l">{t.h.apps_l}</div></div>
      </div>

      {/* recommendations */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
        <div className="im-title" style={{ fontSize: 17 }}>{t.h.rec}</div>
      </div>
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 12 }}>
        {t.f.map((f, i) => (
          <button key={f} className={`im-filter ${filter === i ? "is-on" : ""}`} onClick={() => setFilter(i)}>{f}</button>
        ))}
      </div>

      {all === null ? <Loading /> : list.length === 0 ? <Empty /> :
        <div className="im-list">{list.map((o) => <OppCard key={o.id} opp={o} onClick={() => nav(`/opp/${o.id}`)} />)}</div>}
      {all && (all.filter((o) => !cats || cats.includes(o.category)).length > limit) && (
        <button className="im-btn im-btn--ghost" style={{ marginTop: 4 }} onClick={() => setLimit(limit + 12)}>{t.h.more}</button>
      )}
    </AppScreen>
  );
}
