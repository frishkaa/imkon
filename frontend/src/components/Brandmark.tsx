// Imkon brand mark recreated from the uploaded logo: indigo "i" (person) +
// cyan->green gradient "k" chevron. Plus a wordmark and a Tajikistan emblem.

export function Brandmark({ size = 48, boxed = false }: { size?: number; boxed?: boolean }) {
  const gid = "ikg" + size;
  const svg = (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id={gid} x1="32" y1="10" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22B5E0" /><stop offset="1" stopColor="#3DDC84" />
        </linearGradient>
      </defs>
      {/* i — dot + body */}
      <circle cx="17" cy="13.5" r="6.6" fill="#5B5BD6" />
      <rect x="10.6" y="24" width="12.8" height="28" rx="6.4" fill="#5B5BD6" />
      {/* k — chevron pointing right, gradient */}
      <path d="M35 13 L54 32 L35 51" stroke={`url(#${gid})`} strokeWidth="10"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (!boxed) return svg;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "var(--surface)",
      border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "var(--sh-card)" }}>
      <div style={{ width: size * 0.74, height: size * 0.74 }}>
        <Brandmark size={Math.round(size * 0.74)} />
      </div>
    </div>
  );
}

export function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <Brandmark size={size * 1.25} />
      <span style={{ font: `800 ${size}px var(--font-head)`, letterSpacing: "-.03em", color: "var(--ink)" }}>
        Имкон
      </span>
    </div>
  );
}

// Simplified Tajikistan state emblem (crown of stars · sun over mountains · wheat).
export function TajEmblem({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Герб Таджикистана">
      <circle cx="32" cy="33" r="22" fill="#EAF3FF" stroke="#CA8A04" strokeWidth="1.5" />
      {/* crown of 7 stars */}
      {[14, 21, 28, 32, 36, 43, 50].map((x, i) => (
        <circle key={i} cx={x} cy={11 - (i === 3 ? 3 : Math.abs(3 - i) <= 1 ? 1 : 0)} r="1.7" fill="#CA8A04" />
      ))}
      {/* sun + rays */}
      <circle cx="32" cy="28" r="6.5" fill="#F4B400" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={32 + Math.cos(a) * 8} y1={28 + Math.sin(a) * 8}
          x2={32 + Math.cos(a) * 11} y2={28 + Math.sin(a) * 11} stroke="#F4B400" strokeWidth="1.4" strokeLinecap="round" />;
      })}
      {/* mountains */}
      <path d="M14 46 L26 32 L34 42 L44 28 L52 46 Z" fill="#16A34A" opacity="0.9" />
      {/* ribbon */}
      <path d="M16 50 q16 7 32 0" stroke="#E5484D" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
