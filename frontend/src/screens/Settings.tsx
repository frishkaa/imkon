import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { LANG_LABEL, type Lang } from "../i18n";
import { Icon } from "../components/icons";
import { BackBar, Phone, Screen, Status } from "../components/ui";

export function Settings() {
  const nav = useNavigate();
  const { t, lang, setLang, user, refresh, logout, toast } = useSession();
  const [pub, setPub] = useState(!!user?.profile_public);

  async function togglePublic() {
    if (!user) return;
    const next = !pub; setPub(next);
    try { await api.updateUser(user.id, { profile_public: next }); await refresh(); toast("✓"); }
    catch (e) { setPub(!next); toast((e as Error).message); }
  }
  function doLogout() { logout(); nav("/"); }

  const Row = ({ icon, label, onClick, right }: { icon: string; label: string; onClick?: () => void; right?: React.ReactNode }) => (
    <button className="im-card im-press" style={{ width: "100%", textAlign: "left", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={18} color="var(--teal)" /></div>
      <span style={{ flex: 1, font: "600 15px var(--font-ui)", color: "var(--ink)" }}>{label}</span>
      {right ?? <Icon name="chev" size={18} color="var(--muted)" />}
    </button>
  );

  return (
    <Phone>
      <Status />
      <BackBar to="/profile" />
      <Screen style={{ padding: "8px 22px 20px" }}>
        <div className="im-q" style={{ fontSize: 24, marginTop: 12, marginBottom: 18 }}>{t.set.title}</div>

        <div className="im-label">{t.set.lang}</div>
        <div className="im-pills" style={{ marginBottom: 18 }}>
          {(["tg", "ru", "en"] as Lang[]).map((l) => (
            <button key={l} className={`im-pill${lang === l ? " is-on" : ""}`} onClick={() => setLang(l)}>{LANG_LABEL[l]}</button>
          ))}
        </div>

        <div className="im-card" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="eye" size={18} color="var(--teal)" /></div>
          <div style={{ flex: 1 }}><div style={{ font: "600 15px var(--font-ui)", color: "var(--ink)" }}>{t.set.public}</div>
            <div className="im-meta" style={{ marginTop: 2 }}>{t.set.public_sub}</div></div>
          <button onClick={togglePublic} aria-label="toggle" style={{ width: 46, height: 28, borderRadius: 99, border: "none", cursor: "pointer",
            background: pub ? "var(--teal)" : "var(--line-input)", position: "relative", transition: "background .2s" }}>
            <span style={{ position: "absolute", top: 3, left: pub ? 21 : 3, width: 22, height: 22, borderRadius: 99, background: "#fff", transition: "left .2s", boxShadow: "var(--sh-card)" }} /></button>
        </div>

        <Row icon="user" label={t.set.org_cab} onClick={() => nav("/org")} />
        <Row icon="bell" label={t.set.support} onClick={() => nav("/support")} />
        <Row icon="spark" label={t.pr.resume_ai} onClick={() => nav("/resume-builder")} />

        <div className="im-card im-card--sunk" style={{ marginTop: 8, textAlign: "center" }}>
          <div className="im-meta">{t.set.about} · {t.set.version} 2.0</div>
        </div>

        <button onClick={doLogout} className="im-btn im-btn--ghost" style={{ marginTop: 16, color: "var(--terra)", borderColor: "var(--line-input)" }}>{t.set.logout}</button>
      </Screen>
    </Phone>
  );
}
