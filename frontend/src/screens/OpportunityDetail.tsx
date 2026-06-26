import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { Logo } from "../components/icons";
import { BackBar, Btn, Loading, Phone, Screen, Status } from "../components/ui";
import type { Opportunity } from "../types";

export function OpportunityDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { t, toast } = useSession();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (id) api.opportunity(id).then(setOpp).catch(() => {}); }, [id]);

  async function apply() {
    if (!opp) return;
    setBusy(true);
    try { await api.apply({ opportunity_id: opp.id }); toast(t.od.applied); }
    catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginTop: 16 }}>
      <div className="im-section">{label}</div>
      <div className="im-body" style={{ marginTop: 4, color: "var(--ink)" }}>{children}</div>
    </div>
  );

  return (
    <Phone>
      <Status />
      <BackBar onBack={() => nav(-1)} />
      {!opp ? <Loading /> : (
        <>
          <Screen style={{ padding: "10px 26px 16px" }}>
            <div className="im-row" style={{ gap: 12 }}>
              <Logo name={opp.organization} size={46} />
              <div><div className="im-q" style={{ fontSize: 22, letterSpacing: "-.02em" }}>{opp.title}</div>
                <div className="im-meta" style={{ marginTop: 3 }}>{opp.organization}</div></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <span className="im-tag" style={{ color: opp.is_free ? "var(--teal)" : "var(--text-3)" }}>
                {opp.is_free ? t.p.free : "—"}</span>
              {opp.location?.length ? <span className="im-tag">{opp.location.join(", ")}</span> : null}
            </div>
            {opp.description && <Row label={t.od.desc}>{opp.description}</Row>}
            {opp.skills_tags?.length ? <Row label={t.od.req}>{opp.skills_tags.join(" · ")}</Row> : null}
            {opp.deadline && <Row label={t.od.deadline}>{opp.deadline}</Row>}
            {opp.contact_info && <Row label={t.od.contact}>{opp.contact_info}</Row>}
            {opp.source_url && <Row label="URL"><a href={opp.source_url} target="_blank" rel="noreferrer" style={{ color: "var(--teal)" }}>{opp.source_url}</a></Row>}
          </Screen>
          <div className="foot">
            <Btn variant="primary" onClick={apply} disabled={busy}>{t.od.apply}</Btn>
          </div>
        </>
      )}
    </Phone>
  );
}
