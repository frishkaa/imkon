import { useNavigate } from "react-router-dom";
import { useSession } from "../store";
import { Brandmark } from "../components/Brandmark";
import { Icon } from "../components/icons";
import { Btn, LangPills, Phone, Status } from "../components/ui";

export function Welcome() {
  const nav = useNavigate();
  const { t } = useSession();
  return (
    <Phone>
      <Status />
      <div className="screen" style={{ display: "flex", flexDirection: "column" }}>
        <div className="center" style={{ flex: 1 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: "var(--grad-ik-soft)", filter: "blur(6px)" }} />
            <Brandmark size={72} />
          </div>
          <div className="im-h1" style={{ marginTop: 18, fontSize: 34, letterSpacing: "-.03em" }}>Имкон</div>
          <div className="im-body" style={{ marginTop: 10 }}>{t.w.slogan}</div>
          <div style={{ marginTop: 26 }}><LangPills /></div>
        </div>
        <div className="foot">
          <Btn variant="primary" onClick={() => nav("/register")}>{t.w.register}</Btn>
          <Btn variant="outline" onClick={() => nav("/register")}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="send" size={18} color="var(--ink)" fill="var(--ink)" width={0} />{t.w.tg}
          </Btn>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            marginTop: 6, font: "500 13px var(--font-ui)", color: "var(--text-3)" }}>
            {t.w.have} <span onClick={() => nav("/login")}
              style={{ color: "var(--teal)", fontWeight: 600, cursor: "pointer" }}>{t.w.login}</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 2 }}>
            <span onClick={() => nav("/org")} style={{ font: "500 12px var(--font-ui)", color: "var(--muted)", cursor: "pointer" }}>
              {t.w.org} →
            </span>
          </div>
        </div>
      </div>
    </Phone>
  );
}
