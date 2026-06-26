// Lucide-style icon set + company brand monograms, ported from the v2 prototype.
import { TajEmblem } from "./Brandmark";

export const IC: Record<string, string> = {
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  scale: "M16 16l3-8 3 8c-2 1.5-4 1.5-6 0M2 16l3-8 3 8c-2 1.5-4 1.5-6 0M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",
  cross: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
  hands: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z",
  coin: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v12M15.5 9a3.5 3 0 0 0-3.5-2c-2 0-3.2 1-3.2 2.3 0 1.5 1.2 2 3.7 2.7s3.7 1.2 3.7 2.7c0 1.3-1.2 2.3-3.2 2.3a3.5 3 0 0 1-3.5-2",
  work: "M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18",
  puzzle: "M9.5 2a2 2 0 0 1 2 2c0 .5-.2 1-.5 1.5h3a1 1 0 0 1 1 1v3c.5-.3 1-.5 1.5-.5a2 2 0 1 1 0 4c-.5 0-1-.2-1.5-.5v3a1 1 0 0 1-1 1h-3c.3.5.5 1 .5 1.5a2 2 0 1 1-4 0c0-.5.2-1 .5-1.5h-3a1 1 0 0 1-1-1v-3c-.5.3-1 .5-1.5.5a2 2 0 1 1 0-4c.5 0 1 .2 1.5.5V6.5a1 1 0 0 1 1-1h3C7.7 5 7.5 4.5 7.5 4a2 2 0 0 1 2-2z",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
  react: "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  server: "M3 5h18a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 14h18a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1zM6 7.5h.01M6 16.5h.01",
  flag: "M4 21V4M4 4h13l-2.5 4L17 12H4",
  check: "M5 12l4.5 4.5L19 7",
  up: "M3 17l6-6 4 4 8-8M15 7h6v6",
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  path: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h6a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h5",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6.5 8-6.5s8 2.5 8 6.5",
  bell: "M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z",
  arrow: "M15 18l-6-6 6-6",
  chev: "M9 6l6 6-6 6",
  lock: "M5 11a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8zM8 10V7a4 4 0 0 1 8 0v3",
  cap: "M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1.5 2.7 2.5 6 2.5s6-1 6-2.5v-5M22 10v6",
  spark: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM18.5 13.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  crown: "M4 18h16M5 18l-1-9 5 4 3-7 3 7 5-4-1 9",
  filter: "M3 5h18l-7 8v6l-4 2v-8z",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  star: "M12 3l2.9 6.3 6.6.6-5 4.4 1.5 6.6L12 17.8 5.5 21l1.5-6.6-5-4.4 6.6-.6z",
  pdf: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6",
  copy: "M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
};

export function Icon({ name, size = 22, color = "currentColor", width = 2, fill = "none" }:
  { name: string; size?: number; color?: string; width?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={IC[name] || ""} />
    </svg>
  );
}

interface Brand { bg: string; t?: string; fs?: number; glyph?: boolean; }
const BRANDS: [string[], Brand][] = [
  [["alif"], { bg: "#7A2FF6", t: "alif", fs: 0.3 }],
  [["megafon", "мегафон"], { bg: "#1FA84B", t: "Mega", fs: 0.28 }],
  [["zypl"], { bg: "#111118", t: "zypl", fs: 0.3 }],
  [["babilon"], { bg: "#E23B2E", t: "Bab", fs: 0.3 }],
  [["oson"], { bg: "#F7941D", t: "OSON", fs: 0.28 }],
  [["spitamen"], { bg: "#0E7C66", t: "Spit", fs: 0.3 }],
  [["eskhata"], { bg: "#C8102E", t: "Esk", fs: 0.3 }],
  [["humo"], { bg: "#E11D48", t: "Humo", fs: 0.28 }],
  [["amonat"], { bg: "#15803D", t: "Amo", fs: 0.3 }],
  [["tcell"], { bg: "#E6007E", t: "Tcell", fs: 0.26 }],
  [["auchan"], { bg: "#E2231A", t: "Auch", fs: 0.28 }],
  [["paykar"], { bg: "#F59E0B", t: "Pay", fs: 0.3 }],
  [["sello"], { bg: "#1D4ED8", t: "Sello", fs: 0.27 }],
  [["zood"], { bg: "#22C55E", t: "Zood", fs: 0.28 }],
  [["merve"], { bg: "#B45309", t: "Merve", fs: 0.25 }],
  [["salsa"], { bg: "#DB2777", t: "Salsa", fs: 0.26 }],
  [["нон"], { bg: "#CA8A04", t: "Нон", fs: 0.3 }],
  [["зебо", "zebo"], { bg: "#A21CAF", t: "Зебо", fs: 0.28 }],
  [["усто", "usto"], { bg: "#334155", t: "Усто", fs: 0.28 }],
  [["express"], { bg: "#0891B2", t: "Exp", fs: 0.3 }],
  [["yandex", " go"], { bg: "#1A1A1A", t: "Go" }],
  [["бинокор", "binokor"], { bg: "#EA580C", t: "Бин", fs: 0.3 }],
  [["барки", "barki"], { bg: "#1E40AF", t: "БТ", fs: 0.3 }],
  [["шифо", "shifo"], { bg: "#0D9488", t: "Шифо", fs: 0.28 }],
  [["аптека", "дил"], { bg: "#059669", t: "Дил", fs: 0.3 }],
  [["идея", "ideya"], { bg: "#7C3AED", t: "Идея", fs: 0.27 }],
  [["cloud"], { bg: "#0EA5E9", t: "cloud", fs: 0.28 }],
  [["dc tech", "dctech"], { bg: "#2563EB", t: "DC", fs: 0.3 }],
  [["ilmhona", "илмхона"], { bg: "#16A34A", t: "Илм", fs: 0.3 }],
  [["smarthub"], { bg: "#5B5BD6", t: "SH", fs: 0.3 }],
  [["ielts"], { bg: "#B5121B", t: "IE", fs: 0.3 }],
  [["american school", "ast"], { bg: "#2563EB", t: "AST", fs: 0.3 }],
  [["профобуч", "профобучения", "птУ"], { bg: "#0E7C66", t: "ПТУ", fs: 0.28 }],
  [["unicef", "юнисеф"], { bg: "#1CABE2", t: "UN", fs: 0.3 }],
  [["sitora", "ситора"], { bg: "#CA8A04", t: "Sit", fs: 0.3 }],
  [["красный полумесяц", "caritas", "little earth"], { bg: "#DC2626", t: "+", fs: 0.4 }],
];
export function brandFor(org?: string | null): Brand {
  const o = (org || "").toLowerCase();
  for (const [keys, brand] of BRANDS) if (keys.some((k) => o.includes(k))) return brand;
  if (["президент", "минобр", "маориф", "вазорат", "донишгоҳ", "университ", "славян", "технич", "минспорта", "правитель"].some((k) => o.includes(k)))
    return { bg: "#0E5C2E", glyph: true };
  return { bg: "#3A3A46", t: (o.replace(/[^a-zа-яё]/i, "")[0] || "?").toUpperCase() };
}

export function Logo({ name, size = 44, radius = 12, color, text }:
  { name?: string | null; size?: number; radius?: number; color?: string | null; text?: string | null }) {
  const b = brandFor(name);
  const isGov = b.glyph && !text;
  if (isGov) {
    return (
      <div style={{ width: size, height: size, borderRadius: radius, background: "#fff", display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "var(--sh-card)",
        border: "1px solid var(--line)", overflow: "hidden" }}>
        <TajEmblem size={Math.round(size * 0.82)} />
      </div>
    );
  }
  const bg = color || b.bg;
  const t = text || b.t || "?";
  const fs = Math.round(size * (t.length > 2 ? 0.26 : t.length > 1 ? 0.34 : 0.42));
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: bg, display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "var(--sh-card)", overflow: "hidden" }}>
      <span style={{ font: `800 ${fs}px var(--font-head)`, letterSpacing: "-.02em", color: "#fff", padding: "0 2px" }}>{t}</span>
    </div>
  );
}
