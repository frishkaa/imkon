import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { Icon, Logo } from "../components/icons";
import { BackBar, Btn, Field, Loading, Phone, Screen, Status } from "../components/ui";
import type { Org, VerificationItem } from "../types";

export function OrgCabinet() {
  const nav = useNavigate();
  const { t, toast } = useSession();
  const [orgToken, setOrgToken] = useState<string | null>(sessionStorage.getItem("imkon_org_token"));
  const [org, setOrg] = useState<Org | null>(JSON.parse(sessionStorage.getItem("imkon_org") || "null"));
  const [email, setEmail] = useState("org@ilmhona.tj");
  const [password, setPassword] = useState("ilmhona123");
  const [items, setItems] = useState<VerificationItem[] | null>(null);
  const [busy, setBusy] = useState(false);

  const loadQueue = useCallback(async (o: Org, tok: string) => {
    try { const r = await api.orgVerifications(o.id, tok, "pending"); setItems(r.items); } catch { setItems([]); }
  }, []);
  useEffect(() => { if (org && orgToken) loadQueue(org, orgToken); }, [org, orgToken, loadQueue]);

  async function loginOrg() {
    setBusy(true);
    try {
      const { token, org: o } = await api.orgLogin(email, password);
      sessionStorage.setItem("imkon_org_token", token);
      sessionStorage.setItem("imkon_org", JSON.stringify(o));
      setOrgToken(token); setOrg(o);
    } catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }
  function logoutOrg() {
    sessionStorage.removeItem("imkon_org_token"); sessionStorage.removeItem("imkon_org");
    setOrgToken(null); setOrg(null); setItems(null);
  }
  async function resolve(id: string, decision: "confirmed" | "rejected") {
    if (!orgToken || !org) return;
    try {
      const res = await api.resolveVerification(id, decision, orgToken);
      toast(decision === "confirmed" ? `${t.org.confirmed} · Trust: ${(res as { trust_score?: number }).trust_score ?? ""}` : t.org.rejected);
      loadQueue(org, orgToken);
    } catch (e) { toast((e as Error).message || t.x.error); }
  }

  if (!orgToken || !org) return (
    <Phone>
      <Status />
      <BackBar to="/" />
      <Screen style={{ padding: "8px 26px" }}>
        <div className="im-q" style={{ fontSize: 24, marginTop: 12 }}>{t.org.login}</div>
        <Field label={t.x.email}><input className="im-input" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label={t.x.password}><input className="im-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <div style={{ marginTop: 18 }}><Btn variant="primary" onClick={loginOrg} disabled={busy}>{t.w.login}</Btn></div>
        <div className="im-meta" style={{ marginTop: 12 }}>Демо: org@ilmhona.tj / ilmhona123</div>
      </Screen>
    </Phone>
  );

  return (
    <Phone>
      <Status />
      <div className="hd">
        <button className="back" onClick={logoutOrg}><Icon name="arrow" color="var(--ink)" /></button>
        <div className="im-row" style={{ gap: 10 }}><Logo name={org.name} size={34} />
          <div style={{ font: "600 15px var(--font-ui)", color: "var(--ink)" }}>{org.name}</div></div>
      </div>
      <Screen style={{ padding: "12px 22px 20px" }}>
        <div className="im-section">{t.org.sub}</div>
        {items === null ? <Loading /> : items.length === 0 ? (
          <div className="im-card im-card--sunk im-meta" style={{ marginTop: 12 }}>{t.org.empty}</div>
        ) : <div className="listgap" style={{ marginTop: 12 }}>{items.map((it) => (
          <div key={it.id} className="im-card">
            <div className="im-section" style={{ color: "var(--teal)" }}>{t.org.who}</div>
            <div className="im-title" style={{ fontSize: 16, marginTop: 3 }}>{it.user_display}</div>
            <div className="im-body" style={{ marginTop: 6 }}>{it.claim_type}: {JSON.stringify(it.claim_detail)}</div>
            <div className="im-btn-row" style={{ marginTop: 14 }}>
              <Btn variant="primary" grow onClick={() => resolve(it.id, "confirmed")}>{t.org.confirm}</Btn>
              <Btn variant="ghost" grow onClick={() => resolve(it.id, "rejected")}>{t.org.reject}</Btn>
            </div>
          </div>))}</div>}
        <button onClick={logoutOrg} style={{ background: "none", border: "none", cursor: "pointer", marginTop: 14, font: "500 13px var(--font-ui)", color: "var(--muted)" }}>← {t.org.logout}</button>
      </Screen>
    </Phone>
  );
}
