import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { RoadmapPath } from "../components/RoadmapPath";
import { Icon, Logo } from "../components/icons";
import { Btn, Loading, Phone, Screen, Status } from "../components/ui";
import type { PublicProfile as PP } from "../types";

export function PublicProfile() {
  const { token } = useParams();
  const { t, toast } = useSession();
  const [p, setP] = useState<PP | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => { if (token) api.publicProfile(token).then(setP).catch(() => setErr(true)); }, [token]);

  if (err) return <Phone><Status /><div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>{t.x.error}</div></Phone>;
  if (!p) return <Phone><Status /><Loading /></Phone>;
  const initials = (p.display_name || "И").trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginTop: 18 }}><div className="im-section">{title}</div><div style={{ marginTop: 9 }}>{children}</div></div>
  );

  return (
    <Phone>
      <Status />
      <Screen style={{ padding: "10px 22px 24px" }}>
        <div className="im-card im-card--tint" style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
          <Icon name="check" size={15} color="var(--teal)" />
          <span style={{ font: "600 12px var(--font-ui)", color: "var(--teal)" }}>{t.pub.badge}</span>
        </div>

        <div className="im-card" style={{ marginTop: 14, padding: 18 }}>
          <div className="im-row" style={{ gap: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "var(--teal)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", font: "800 22px var(--font-head)" }}>{initials}</div>
            <div style={{ flex: 1 }}><div className="im-h1" style={{ fontSize: 21 }}>{p.display_name}</div>
              <div className="im-meta" style={{ marginTop: 2 }}>{p.city} · {p.age_bucket}</div></div>
          </div>
          {p.bio && <p className="im-body" style={{ marginTop: 12 }}>{p.bio}</p>}
          <div className="im-row" style={{ gap: 14, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
            <span className="im-trust" style={{ fontSize: 30 }}>{p.trust_score}</span>
            <div><div className="im-trust-cap">{t.pub.trust}</div></div>
          </div>
        </div>

        {p.skills?.length > 0 && <Section title={t.pr.skills}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {p.skills.map((s, i) => <span key={i} className="im-chip">{s.name}{s.verified ? <span className="tick"> ✓</span> : ""}</span>)}</div>
        </Section>}

        {p.verified_achievements.length > 0 && <Section title={t.pr.verified}>
          <div className="listgap">{p.verified_achievements.map((a) => (
            <div key={a.id} className="im-card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Logo name={a.verified_by} size={38} />
              <div><div style={{ font: "600 14px var(--font-ui)" }}>{a.title}</div>
                <div className="im-meta" style={{ marginTop: 2 }}>{a.verified_by} ✓</div></div></div>))}</div>
        </Section>}

        {p.roadmaps?.[0] && <Section title={t.pub.path}>
          <RoadmapPath roadmap={p.roadmaps[0]} onTakeCourse={() => {}} onApply={() => {}} readonly />
        </Section>}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Btn variant="primary" grow onClick={() => toast(t.pub.invited)}>{t.pub.invite}</Btn>
          {token && <Btn variant="outline" onClick={() => window.open(api.pdfUrl(token), "_blank")} style={{ width: "auto", padding: "0 18px" }}>PDF</Btn>}
        </div>
      </Screen>
    </Phone>
  );
}
