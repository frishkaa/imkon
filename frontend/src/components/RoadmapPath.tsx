import { useRef, useState } from "react";
import { useSession } from "../store";
import type { RoadmapSteps, Step } from "../types";
import { Icon, Logo } from "./icons";
import { Btn, Sheet } from "./ui";

type NState = "done" | "current" | "locked" | "goal";
function nstate(s: Step): NState {
  if (s.is_final_job) return "goal";
  return (s.status as NState) || "locked";
}
function NodeFace({ s, size }: { s: Step; size?: number }) {
  const st = nstate(s);
  if (st === "done") return <Icon name="check" size={size || 22} color="#fff" width={2.5} />;
  if (st === "goal") return <Icon name="flag" size={size || 20} color="#fff" />;
  if (st === "locked") return <Icon name="lock" size={size || 18} color="var(--muted-2)" />;
  return <span style={{ font: "700 20px var(--font-head)", color: "#fff" }}>{s.order}</span>;
}

/* ---------------- Duolingo winding path ---------------- */
function DuoPath({ roadmap, onPick }: { roadmap: RoadmapSteps; onPick: (s: Step) => void }) {
  const { t } = useSession();
  return (
    <div className="duo">
      <div className="duo-spine" />
      {roadmap.steps.map((s, i) => {
        const st = nstate(s);
        const left = i % 2 === 0;
        return (
          <div className="duo-row" key={s.id} style={{ justifyContent: left ? "flex-start" : "flex-end" }}>
            <button className="duo-cell" onClick={() => onPick(s)}>
              {st === "current" && <span className="im-here">{t.p.here}</span>}
              <div className={`im-node ${st === "done" ? "im-node--done" : st === "current" ? "im-node--current"
                : st === "goal" ? "im-node--goal" : ""}`}>
                <NodeFace s={s} />
              </div>
              <div className="duo-lbl" style={st === "locked" ? { color: "var(--muted-2)" } : st === "current" ? { color: "var(--ink)", fontWeight: 700 } : undefined}>
                {s.label}
              </div>
              {st === "goal" && (
                <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
                  <Logo name="Alif" size={22} radius={7} /><Logo name="Zypl" size={22} radius={7} />
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Draggable / zoomable graph ---------------- */
function GraphView({ roadmap, onPick }: { roadmap: RoadmapSteps; onPick: (s: Step) => void }) {
  const { t } = useSession();
  const W = 300;
  const stepY = 118;
  const nodes = roadmap.steps.map((s, i) => ({
    s, x: W / 2 + (i % 2 === 0 ? -64 : 64) * (i === 0 ? 0 : 1), y: 70 + i * stepY,
  }));
  const H = 80 + roadmap.steps.length * stepY;
  const [tf, setTf] = useState({ x: 20, y: 0, s: 0.92 });
  const drag = useRef<{ on: boolean; moved: boolean; sx: number; sy: number; ox: number; oy: number }>(
    { on: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  function down(e: React.PointerEvent) {
    drag.current = { on: true, moved: false, sx: e.clientX, sy: e.clientY, ox: tf.x, oy: tf.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function move(e: React.PointerEvent) {
    const d = drag.current; if (!d.on) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
    setTf((p) => ({ ...p, x: d.ox + dx, y: d.oy + dy }));
  }
  function up() { drag.current.on = false; }
  const zoom = (f: number) => setTf((p) => ({ ...p, s: Math.min(1.8, Math.max(0.5, p.s * f)) }));

  return (
    <div className="gph" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
      <div className="gph-hint"><span className="pin" /> {t.p.tap}</div>
      <div className="gph-zoom">
        <button onClick={() => zoom(1.18)}>+</button>
        <button onClick={() => zoom(1 / 1.18)}>−</button>
      </div>
      <div className="gph-stage" style={{ transform: `translate(${tf.x}px,${tf.y}px) scale(${tf.s})` }}>
        <svg className="gph-edges" width={W} height={H}>
          {nodes.slice(1).map((n, i) => {
            const p = nodes[i];
            const done = nstate(n.s) === "done" || nstate(p.s) === "done";
            return <line key={i} x1={p.x} y1={p.y} x2={n.x} y2={n.y}
              stroke={done ? "var(--gold)" : "var(--line-input)"} strokeWidth={3}
              strokeDasharray={done ? "0" : "5 6"} strokeLinecap="round" />;
          })}
        </svg>
        {nodes.map((n) => (
          <div key={n.s.id} className="gph-node" data-st={nstate(n.s)} style={{ left: n.x, top: n.y }}
            onClick={() => { if (!drag.current.moved) onPick(n.s); }}>
            <div className="gph-dot"><NodeFace s={n.s} size={nstate(n.s) === "current" ? 24 : 20} /></div>
            <div className="gph-lbl">{n.s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Public component ---------------- */
export function RoadmapPath({ roadmap, onTakeCourse, onApply, readonly }:
  { roadmap: RoadmapSteps; onTakeCourse: (s: Step) => void; onApply: (s: Step) => void; readonly?: boolean }) {
  const { t } = useSession();
  const [sel, setSel] = useState<Step | null>(null);
  const [view, setView] = useState<"map" | "graph">("map");
  const pct = roadmap.progress.total ? roadmap.progress.done / roadmap.progress.total : 0;

  return (
    <div>
      {/* progress header */}
      <div className="im-card im-card--warm" style={{ marginBottom: 14 }}>
        <div className="im-spread">
          <div className="im-step" style={{ color: "var(--teal)" }}>{t.p.goal_l}</div>
          <div className="seg">
            <button className={view === "map" ? "on" : ""} onClick={() => setView("map")}>{t.p.map}</button>
            <button className={view === "graph" ? "on" : ""} onClick={() => setView("graph")}>{t.p.graph}</button>
          </div>
        </div>
        <div className="im-title" style={{ fontSize: 18, marginTop: 8 }}>{roadmap.goal}</div>
        <div className="im-progress" style={{ marginTop: 11 }}><i style={{ width: `${pct * 100}%` }} /></div>
        <div className="im-meta" style={{ marginTop: 8 }}>{roadmap.progress.label}</div>
      </div>

      {view === "map"
        ? <DuoPath roadmap={roadmap} onPick={setSel} />
        : <div style={{ height: 440, display: "flex" }}><GraphView roadmap={roadmap} onPick={setSel} /></div>}

      <Sheet open={!!sel} onClose={() => setSel(null)}>
        {sel && (() => {
          const st = nstate(sel);
          return (
            <div>
              <div className="im-row" style={{ gap: 13 }}>
                <div className={`im-node ${st === "done" ? "im-node--done" : st === "current" ? "im-node--current"
                  : st === "goal" ? "im-node--goal" : ""}`} style={{ width: 46, height: 46, animation: "none" }}>
                  <NodeFace s={sel} size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="im-title" style={{ fontSize: 17 }}>{sel.label}</div>
                  {sel.suggested_resource && <div className="im-meta" style={{ marginTop: 3 }}>{sel.suggested_resource}</div>}
                </div>
              </div>
              {sel.description && <p className="im-body" style={{ marginTop: 12 }}>{sel.description}</p>}
              <div style={{ marginTop: 16 }}>
                {readonly ? <div className="im-card im-card--sunk" style={{ textAlign: "center", color: "var(--muted)" }}>{sel.label}</div>
                  : st === "goal" ? <Btn variant="primary" onClick={() => { onApply(sel); setSel(null); }}
                      style={{ background: "var(--terra)" }}>{t.od.apply}</Btn>
                  : st === "locked" ? <Btn variant="ghost" disabled>{t.p.node_lock}</Btn>
                  : <Btn variant="primary" onClick={() => { onTakeCourse(sel); setSel(null); }}>{t.p.take}</Btn>}
              </div>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}
