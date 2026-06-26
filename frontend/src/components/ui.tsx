import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../store";
import { LANG_LABEL, type Lang } from "../i18n";
import { Icon } from "./icons";

export function Phone({ children }: { children: ReactNode }) {
  return <div className="im-stage"><div className="phone">{children}</div></div>;
}

export function Status() {
  return <div className="top"><span>9:41</span><span className="dots">●●●</span></div>;
}

export function Screen({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div className="screen" style={style}>{children}</div>;
}

export function BackBar({ to, onBack, progress, right }:
  { to?: string; onBack?: () => void; progress?: number; right?: ReactNode }) {
  const nav = useNavigate();
  const back = () => (onBack ? onBack() : to ? nav(to) : nav(-1));
  return (
    <div className="hd">
      <button className="back" onClick={back} aria-label="back"><Icon name="arrow" color="var(--ink)" /></button>
      {progress !== undefined && (
        <div className="im-progress" style={{ margin: "0 4px" }}>
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
      {right}
    </div>
  );
}

export function LangPills() {
  const { lang, setLang } = useSession();
  const order: Lang[] = ["tg", "ru", "en"];
  return (
    <div className="im-pills">
      {order.map((l) => (
        <button key={l} className={`im-pill${lang === l ? " is-on" : ""}`} onClick={() => setLang(l)}>
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

type Variant = "primary" | "dark" | "outline" | "ghost";
export function Btn({ children, variant = "primary", onClick, disabled, grow, sm, style, type }:
  { children: ReactNode; variant?: Variant; onClick?: () => void; disabled?: boolean;
    grow?: boolean; sm?: boolean; style?: CSSProperties; type?: "button" | "submit" }) {
  return (
    <button type={type || "button"}
      className={`im-btn im-btn--${variant}${grow ? " im-btn--grow" : ""}${sm ? " im-btn--sm" : ""}${disabled ? " disabled" : ""}`}
      onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 14 }}>
      {label && <label className="im-label">{label}</label>}
      {children}
      {hint && <div className="im-meta" style={{ marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

export function Sheet({ open, onClose, children }:
  { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="sheet-wrap show">
      <div className="sheet-scrim" onClick={onClose} />
      <div className="sheet">
        <div className="grip" onClick={onClose} />
        {children}
      </div>
    </div>
  );
}

export function Loading({ label }: { label?: string }) {
  const { t } = useSession();
  return <div style={{ padding: 44, textAlign: "center", color: "var(--muted)", font: "500 15px var(--font-ui)" }}>
    {label || t.x.loading}</div>;
}

export function Empty({ children }: { children?: ReactNode }) {
  const { t } = useSession();
  return <div style={{ padding: 34, textAlign: "center", color: "var(--muted-2)", font: "500 14px var(--font-ui)" }}>
    {children || t.x.nothing}</div>;
}

export function Chevron({ color = "var(--muted)" }: { color?: string }) {
  return <Icon name="chev" size={18} color={color} />;
}
