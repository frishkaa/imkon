import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { Btn, Field, Phone, Screen, Status, BackBar } from "../components/ui";

export function Login() {
  const nav = useNavigate();
  const { t, login, toast } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const { token, user } = await api.login({ email, password });
      login(token, user);
      nav("/home");
    } catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }

  return (
    <Phone>
      <Status />
      <BackBar to="/" />
      <Screen style={{ padding: "8px 26px 26px" }}>
        <div className="im-q" style={{ fontSize: 26, marginTop: 14 }}>{t.w.login}</div>
        <Field label={t.su.email_l}>
          <input className="im-input" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={t.su.email_ph} />
        </Field>
        <Field label={t.su.pass_l}>
          <input className="im-input" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder={t.su.pass_ph} />
        </Field>
        <div style={{ marginTop: 18 }}>
          <Btn variant="primary" onClick={submit} disabled={busy || !email || !password}>{t.w.login}</Btn>
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <span onClick={() => nav("/register")} style={{ color: "var(--teal)", fontWeight: 600,
            cursor: "pointer", font: "600 14px var(--font-ui)" }}>{t.su.create}</span>
        </div>
      </Screen>
    </Phone>
  );
}
