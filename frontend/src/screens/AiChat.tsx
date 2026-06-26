import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { Icon } from "../components/icons";
import { Btn, Phone, Status } from "../components/ui";

interface Msg { role: "user" | "assistant"; content: string; }

export function AiChat() {
  const nav = useNavigate();
  const { t, user, refresh, toast } = useSession();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: t.h.ai_hero_q },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [goal, setGoal] = useState("");
  const [positions, setPositions] = useState<string[]>([]);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const history = [...msgs, { role: "user" as const, content }];
    setMsgs(history); setInput(""); setBusy(true);
    try {
      const res = await api.aiDialog({ user_id: user?.id, history });
      if (res.done) {
        setGoal(res.goal || "");
        setPositions(res.positions || []);
        setMsgs((m) => [...m, { role: "assistant", content: res.notes || "✅" }]);
        setDone(true); await refresh();
      } else if (res.question) {
        setMsgs((m) => [...m, { role: "assistant", content: res.question! }]);
      }
    } catch (e) { toast((e as Error).message || t.x.error); } finally { setBusy(false); }
  }

  return (
    <Phone>
      <Status />
      <div className="hd">
        <button className="back" onClick={() => nav("/home")}><Icon name="arrow" color="var(--ink)" /></button>
        <div className="im-row" style={{ gap: 9 }}>
          <div className="ai-hero" style={{ all: "unset", display: "flex" }}>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="spark" size={16} color="#fff" fill="#fff" width={0} /></div>
          </div>
          <div><div style={{ font: "600 14px var(--font-ui)", color: "var(--ink)" }}>{t.h.ai_name}</div>
            <div className="im-meta" style={{ color: "var(--teal)" }}>{t.ai.online}</div></div>
        </div>
      </div>
      <div className="screen" style={{ padding: "16px 18px" }}>
        {msgs.map((m, i) => (
          <div key={i} className="bubble" style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <div style={{ maxWidth: "82%", padding: "11px 15px", borderRadius: 16,
              borderBottomRightRadius: m.role === "user" ? 5 : 16, borderBottomLeftRadius: m.role === "user" ? 16 : 5,
              font: "400 15px/1.45 var(--font-ui)", background: m.role === "user" ? "var(--teal)" : "#fff",
              color: m.role === "user" ? "#fff" : "var(--ink)", border: m.role === "user" ? "none" : "1px solid var(--line-card)" }}>
              {m.content}</div>
          </div>
        ))}
        {busy && <div className="typing"><i /><i /><i /></div>}
        <div ref={end} />
      </div>
      <div className="foot">
        {done ? <>
          {(goal || positions.length > 0) && (
            <div className="im-card im-card--tint" style={{ marginBottom: 4 }}>
              {goal && <div><span className="im-section" style={{ color: "var(--teal)" }}>{t.p.goal_l}</span>
                <div className="im-title" style={{ fontSize: 16, marginTop: 3 }}>{goal}</div></div>}
              {positions.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                {positions.map((p) => <span key={p} className="im-chip im-chip--on">{p}</span>)}</div>}
            </div>
          )}
          <Btn variant="primary" onClick={() => { if (goal) localStorage.setItem("imkon_goal", goal); nav("/path"); }}>{t.ai.open_map}</Btn>
          <Btn variant="ghost" onClick={() => nav("/home")}>{t.ai.show}</Btn>
        </> : <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {[t.h.q_scholar, t.h.q_job].map((q) => (
              <span key={q} className="im-chip" style={{ cursor: "pointer" }} onClick={() => send(q)}>{q}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="im-input" value={input} placeholder={t.ai.ph} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
            <Btn variant="primary" sm style={{ width: "auto", padding: "0 18px" }} onClick={() => send()} disabled={busy}>
              <Icon name="send" size={17} color="#fff" fill="#fff" width={0} /></Btn>
          </div>
        </>}
      </div>
    </Phone>
  );
}
