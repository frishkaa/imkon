import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { Icon } from "../components/icons";
import { BackBar, Btn, Loading, Phone, Screen, Status } from "../components/ui";

export function Share() {
  const nav = useNavigate();
  const { t, user, toast } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.createShare(user.id, {}).then((r) => setToken(r.token)).catch(() => {});
  }, [user]);

  const url = token ? `${window.location.origin}/p/${token}` : "";

  async function copy() { try { await navigator.clipboard.writeText(url); toast(t.sh.copied); } catch { toast(t.x.error); } }
  async function revoke() {
    if (!user || !token) return;
    setBusy(true);
    try { await api.revokeShare(user.id, token); toast(t.sh.revoke); setToken(null); }
    catch (e) { toast((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <Phone>
      <Status />
      <BackBar to="/profile" />
      <Screen style={{ padding: "8px 26px 20px" }}>
        <div className="im-q" style={{ fontSize: 24, marginTop: 12 }}>{t.sh.title}</div>
        {!token ? <Loading /> : <>
          <div className="im-card im-card--tint" style={{ marginTop: 18 }}>
            <div className="im-row" style={{ gap: 8 }}>
              <Icon name="eye" size={16} color="var(--teal)" />
              <div style={{ font: "600 13px var(--font-ui)", color: "var(--teal)" }}>{t.sh.vis}</div>
            </div>
            <div className="im-meta" style={{ marginTop: 6 }}>{t.sh.vis_sub}</div>
          </div>
          <div className="im-label" style={{ marginTop: 18 }}>{t.sh.link_l}</div>
          <div className="im-card im-card--sunk" style={{ marginTop: 8, wordBreak: "break-all", font: "500 13px var(--font-ui)", color: "var(--ink)" }}>{url}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            <Btn variant="primary" onClick={copy}><span style={{ display: "inline-flex", gap: 7, alignItems: "center", justifyContent: "center" }}><Icon name="copy" size={16} color="#fff" /> {t.sh.copy}</span></Btn>
            <Btn variant="outline" onClick={() => nav(`/p/${token}`)}>{t.sh.preview}</Btn>
            <Btn variant="outline" onClick={() => window.open(api.pdfUrl(token), "_blank")}><span style={{ display: "inline-flex", gap: 7, alignItems: "center", justifyContent: "center" }}><Icon name="pdf" size={16} color="var(--ink)" /> {t.sh.pdf}</span></Btn>
            <Btn variant="ghost" onClick={revoke} disabled={busy}>{t.sh.revoke}</Btn>
          </div>
        </>}
      </Screen>
    </Phone>
  );
}
