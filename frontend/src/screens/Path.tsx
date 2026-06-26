import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { AppScreen } from "../components/Shell";
import { RoadmapPath } from "../components/RoadmapPath";
import { Icon } from "../components/icons";
import { Btn, Loading, Sheet } from "../components/ui";
import type { Org, RoadmapSteps, Step } from "../types";

export function Path() {
  const nav = useNavigate();
  const { t, user, toast } = useSession();
  const [roadmaps, setRoadmaps] = useState<RoadmapSteps[] | null>(null);
  const [goal, setGoal] = useState(() => {
    const g = localStorage.getItem("imkon_goal") || "";
    if (g) localStorage.removeItem("imkon_goal");
    return g;
  });
  const [busy, setBusy] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [selOrg, setSelOrg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api.userRoadmaps(user.id).then((r) => setRoadmaps(r.roadmaps)).catch(() => setRoadmaps([]));
    api.organizations().then((r) => setOrgs(r.organizations)).catch(() => {});
  }, [user]);

  const current = roadmaps && roadmaps[0];
  const curStep: Step | undefined = current?.steps.find((s) => s.status === "current");

  async function build() {
    if (!user || !goal.trim()) return;
    setBusy(true);
    try { const rm = await api.aiRoadmap(user.id, goal.trim()); setRoadmaps([rm]); }
    catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }
  async function requestVerify() {
    if (!user || !selOrg || !curStep) return;
    setBusy(true);
    try {
      await api.createVerification({ user_id: user.id, org_id: selOrg, claim_type: "course",
        claim_detail: { course: curStep.label }, roadmap_node_id: curStep.id });
      toast(t.od.applied); setVerifyOpen(false);
    } catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }
  const takeCourse = (s: Step) => s.resource?.id ? nav(`/opp/${s.resource.id}`) : toast(s.suggested_resource || t.p.take);
  const apply = (s: Step) => s.vacancy_id ? nav(`/opp/${s.vacancy_id}`) : toast("📨 " + t.p.finish);

  if (roadmaps === null) return <AppScreen><Loading /></AppScreen>;

  return (
    <AppScreen>
      <div className="im-title" style={{ fontSize: 24, padding: "18px 0 4px" }}>{t.nav.path}</div>

      {!current ? (
        <div style={{ textAlign: "center", padding: "26px 4px" }}>
          <div className="im-node im-node--goal" style={{ width: 60, height: 60, margin: "0 auto", animation: "none" }}>
            <Icon name="flag" size={26} color="#fff" /></div>
          <div className="im-q" style={{ fontSize: 22, marginTop: 14 }}>{t.p.empty_t}</div>
          <div className="im-body" style={{ marginTop: 8 }}>{t.p.empty_s}</div>
          <textarea className="im-input" rows={3} placeholder={t.p.empty_ph} value={goal}
            onChange={(e) => setGoal(e.target.value)} style={{ marginTop: 18, resize: "none" }} />
          <Btn variant="primary" onClick={build} disabled={busy || !goal.trim()} style={{ marginTop: 12 }}>
            {busy ? t.p.building : t.p.build}</Btn>
        </div>
      ) : (
        <>
          <RoadmapPath roadmap={current} onTakeCourse={takeCourse} onApply={apply} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            {curStep && <Btn variant="dark" onClick={() => setVerifyOpen(true)}>
              <span style={{ display: "inline-flex", gap: 7, alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" size={16} color="#fff" /> {t.p.verify}</span></Btn>}
            <Btn variant="outline" onClick={() => nav("/share")}>{t.p.share}</Btn>
            <button onClick={() => setRoadmaps([])} style={{ background: "none", border: "none", cursor: "pointer",
              font: "500 13px var(--font-ui)", color: "var(--muted)" }}>{t.p.rebuild}</button>
          </div>
        </>
      )}

      <Sheet open={verifyOpen} onClose={() => setVerifyOpen(false)}>
        <div className="im-title" style={{ fontSize: 19 }}>{t.p.verify}</div>
        <div className="im-meta" style={{ margin: "6px 0 14px" }}>{t.p.select_org} · {curStep?.label}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {orgs.map((o) => (
            <button key={o.id} className={`im-chip ${selOrg === o.id ? "im-chip--on" : ""}`} style={{ cursor: "pointer" }}
              onClick={() => setSelOrg(o.id)}>{o.name}</button>
          ))}
        </div>
        <Btn variant="primary" onClick={requestVerify} disabled={!selOrg || busy} style={{ marginTop: 18 }}>{t.org.req}</Btn>
      </Sheet>
    </AppScreen>
  );
}
