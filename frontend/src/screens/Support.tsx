import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../store";
import { Icon } from "../components/icons";
import { BackBar, Btn, Phone, Screen, Status } from "../components/ui";

export function Support() {
  const nav = useNavigate();
  const { t, toast } = useSession();
  const [open, setOpen] = useState<number | null>(0);
  const [msg, setMsg] = useState("");
  const faq = [[t.sup.q1, t.sup.a1], [t.sup.q2, t.sup.a2], [t.sup.q3, t.sup.a3]];

  return (
    <Phone>
      <Status />
      <BackBar to="/settings" />
      <Screen style={{ padding: "8px 22px 20px" }}>
        <div className="im-q" style={{ fontSize: 24, marginTop: 12 }}>{t.sup.title}</div>
        <div className="im-body" style={{ marginTop: 8 }}>{t.sup.intro}</div>

        <div className="im-card im-card--tint" style={{ marginTop: 16, display: "flex", gap: 16 }}>
          <a href="mailto:help@imkon.tj" className="im-row" style={{ gap: 8, color: "var(--teal)", textDecoration: "none" }}>
            <Icon name="send" size={16} color="var(--teal)" /> help@imkon.tj</a>
          <a href="https://t.me/imkon" target="_blank" rel="noreferrer" className="im-row" style={{ gap: 8, color: "var(--teal)", textDecoration: "none" }}>
            <Icon name="send" size={16} color="var(--teal)" /> @imkon</a>
        </div>

        <div className="im-section" style={{ marginTop: 22 }}>{t.sup.faq}</div>
        <div className="listgap" style={{ marginTop: 10 }}>
          {faq.map(([q, a], i) => (
            <div key={i} className="im-card im-press" style={{ cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
              <div className="im-spread"><span style={{ font: "600 15px var(--font-ui)", color: "var(--ink)" }}>{q}</span>
                <Icon name={open === i ? "arrow" : "chev"} size={16} color="var(--muted)" /></div>
              {open === i && <div className="im-body" style={{ marginTop: 8 }}>{a}</div>}
            </div>
          ))}
        </div>

        <div className="im-section" style={{ marginTop: 22 }}>{t.sup.msg}</div>
        <textarea className="im-input" rows={4} style={{ marginTop: 10, resize: "none" }} value={msg} onChange={(e) => setMsg(e.target.value)} />
        <Btn variant="primary" style={{ marginTop: 12 }} disabled={!msg.trim()} onClick={() => { setMsg(""); toast(t.sup.sent); }}>{t.sup.send}</Btn>
      </Screen>
    </Phone>
  );
}
