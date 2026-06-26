import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { Icon, Logo } from "../components/icons";
import { BackBar, Btn, Loading, Phone, Screen, Status } from "../components/ui";
import { cleanLocations } from "../hooks";
import type { Opportunity } from "../types";

export function VacancyDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { t, toast } = useSession();
  const [v, setV] = useState<Opportunity | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (id) api.opportunity(id).then(setV).catch(() => {}); }, [id]);

  async function apply() {
    if (!v) return;
    setBusy(true);
    try { await api.apply({ opportunity_id: v.id }); toast(t.wk.taken); }
    catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }
  const expL = (e?: string | null) => e ? (t.flt as Record<string, string>)[`exp_${e}`] || e : null;
  const fmtL = (f?: string | null) => f ? (t.flt as Record<string, string>)[`fmt_${f}`] || f : null;
  const salary = v && (v.salary_min || v.salary_max)
    ? `${v.salary_min ?? ""}${v.salary_min && v.salary_max ? "–" : ""}${v.salary_max ?? ""} ${t.vac.month}`
    : t.vac.no_salary;

  const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginTop: 18 }}><div className="im-section">{title}</div><div className="im-body" style={{ marginTop: 7, color: "var(--ink)" }}>{children}</div></div>
  );

  return (
    <Phone>
      <Status />
      <BackBar onBack={() => nav(-1)} />
      {!v ? <Loading /> : (
        <>
          <Screen style={{ padding: "8px 24px 16px" }}>
            <div className="im-row" style={{ gap: 13 }}>
              <Logo name={v.organization} size={54} radius={14} />
              <div style={{ flex: 1 }}>
                <div className="im-h1" style={{ fontSize: 21, lineHeight: 1.15 }}>{v.title}</div>
                <div className="im-meta" style={{ marginTop: 3 }}>{v.organization}{v.sphere ? ` · ${v.sphere}` : ""}</div>
              </div>
            </div>

            <div className="im-card im-card--tint" style={{ marginTop: 16 }}>
              <div className="im-salary im-salary--big">{salary}</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 12 }}>
                {expL(v.experience) && <span className="im-tag"><Icon name="up" size={13} color="var(--text-3)" /> {expL(v.experience)}</span>}
                {fmtL(v.employment_format) && <span className="im-tag"><Icon name="work" size={13} color="var(--text-3)" /> {fmtL(v.employment_format)}</span>}
                {cleanLocations(v.location).slice(0, 2).map((c) => <span key={c} className="im-tag"><Icon name="pin" size={13} color="var(--text-3)" /> {c}</span>)}
              </div>
            </div>

            {v.description && <Block title={t.vac.about}>{v.description}</Block>}
            {v.responsibilities && <Block title={t.vac.resp}>{v.responsibilities}</Block>}
            {v.skills_tags?.length ? (
              <Block title={t.vac.req}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
                  {v.skills_tags.map((s) => <span key={s} className="im-chip">{s}</span>)}
                </div>
              </Block>
            ) : null}
            {v.contact_info && <Block title={t.od.contact}>{v.contact_info}</Block>}
          </Screen>
          <div className="foot">
            <Btn variant="primary" onClick={apply} disabled={busy}>{t.vac.apply}</Btn>
          </div>
        </>
      )}
    </Phone>
  );
}
