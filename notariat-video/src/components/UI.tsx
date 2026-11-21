import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {clamp, ease, soft} from '../anim';

/** Нижний титр (документальный стиль) */
export const Caption: React.FC<{
  children: React.ReactNode;
  from?: number;
  to?: number;
  width?: number;
  bottom?: number;
  accent?: string;
}> = ({children, from = 0, to = 99999, width = 1400, bottom = 72, accent = C.gold}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = soft(f, fps, from);
  const out = interpolate(f, [to - 10, to], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        bottom,
        maxWidth: width,
        display: 'flex',
        opacity: Math.min(a, out),
        transform: `translateX(${(1 - a) * -24}px)`,
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{width: 6, background: accent, flexShrink: 0}} />
      <div
        style={{
          background: 'rgba(12,21,40,0.88)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 600,
          lineHeight: 1.3,
          padding: '20px 34px',
          letterSpacing: -0.2,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Номер и название главы — слева сверху (на видео — светлый вариант) */
export const SceneTag: React.FC<{n: number; title: string; dark?: boolean}> = ({n, title, dark}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = soft(f, fps, 4);
  const line = ease(f, 6, 30);
  return (
    <div style={{position: 'absolute', left: 96, top: 64, opacity: a, fontFamily: FONT, textShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.5)'}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.goldLight, fontVariantNumeric: 'tabular-nums'}}>{String(n).padStart(2, '0')}</div>
        <div style={{fontSize: 22, fontWeight: 700, letterSpacing: 3.5, textTransform: 'uppercase', color: dark ? C.slate : '#FFFFFF'}}>{title}</div>
      </div>
      <div style={{marginTop: 12, height: 2, width: 420 * line, background: dark ? C.slate : 'rgba(255,255,255,0.6)'}} />
    </div>
  );
};

/** Тёмная стеклянная панель поверх видео */
export const Glass: React.FC<{style?: React.CSSProperties; children: React.ReactNode; from?: number; dir?: 'left' | 'right' | 'up'}> = ({style, children, from = 0, dir = 'up'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = soft(f, fps, from);
  const t = dir === 'left' ? `translateX(${(1 - a) * -40}px)` : dir === 'right' ? `translateX(${(1 - a) * 40}px)` : `translateY(${(1 - a) * 30}px)`;
  return (
    <div
      style={{
        position: 'absolute',
        background: 'rgba(12,21,40,0.78)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderTop: `3px solid ${C.gold}`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
        color: '#fff',
        fontFamily: FONT,
        opacity: a,
        transform: t,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Выноска к человеку в кадре: точка, линия, подпись */
export const Callout: React.FC<{x: number; y: number; label: string; from: number; to?: number; len?: number; side?: 'up' | 'down'}> = ({x, y, label, from, to = 99999, len = 90, side = 'up'}) => {
  const f = useCurrentFrame();
  const l = ease(f, from, from + 14);
  const t = ease(f, from + 10, from + 24);
  const out = interpolate(f, [to - 10, to], [1, 0], clamp);
  const dirY = side === 'up' ? -1 : 1;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: out, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: x - 7, top: y - 7, width: 14, height: 14, borderRadius: 7, background: C.goldLight, boxShadow: '0 0 0 6px rgba(216,184,113,0.3)', opacity: l}} />
      <div style={{position: 'absolute', left: x - 1, top: side === 'up' ? y - len * l : y, width: 2, height: len * l, background: 'rgba(255,255,255,0.85)'}} />
      <div
        style={{
          position: 'absolute',
          left: x - 2,
          top: y + dirY * len + (side === 'up' ? -46 : 0),
          opacity: t,
          background: 'rgba(12,21,40,0.85)',
          borderLeft: `4px solid ${C.gold}`,
          color: '#fff',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          padding: '10px 16px',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Галочка в круге (SVG) */
export const CheckMark: React.FC<{r?: number; progress?: number; color?: string}> = ({r = 22, progress = 1, color = C.green}) => {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <g opacity={Math.min(1, p * 2)}>
      <circle r={r} fill={color} />
      <path
        d={`M${-r * 0.4} ${r * 0.02} L${-r * 0.1} ${r * 0.32} L${r * 0.44} ${-r * 0.28}`}
        stroke="#fff"
        strokeWidth={r * 0.16}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.max(0, Math.min(1, p * 1.5 - 0.3))}
      />
    </g>
  );
};

/** Импульс платежа — золотая точка с ореолом */
export const Pulse: React.FC<{r?: number}> = ({r = 7}) => (
  <g>
    <circle r={r * 2.4} fill={C.goldLight} opacity={0.18} />
    <circle r={r} fill={C.goldLight} />
    <circle r={r * 0.45} fill="#fff" opacity={0.85} />
  </g>
);

/** Простые линейные иконки (белые) */
export const Icon: React.FC<{name: 'budget' | 'price' | 'clock' | 'id' | 'house' | 'mind' | 'shield'; size?: number; color?: string}> = ({name, size = 56, color = '#fff'}) => {
  const st = {stroke: color, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {name === 'budget' && (
        <g {...st}>
          <path d="M6 18 L24 8 L42 18 Z" />
          <path d="M10 20 V34 M18 20 V34 M30 20 V34 M38 20 V34" />
          <path d="M5 38 H43" />
        </g>
      )}
      {name === 'price' && (
        <g {...st}>
          <path d="M8 10 H26 L40 24 L26 38 L8 20 Z" />
          <circle cx={16} cy={18} r={3} />
        </g>
      )}
      {name === 'clock' && (
        <g {...st}>
          <circle cx={24} cy={24} r={16} />
          <path d="M24 14 V24 L31 28" />
        </g>
      )}
      {name === 'id' && (
        <g {...st}>
          <rect x={6} y={12} width={36} height={24} rx={3} />
          <circle cx={17} cy={23} r={4} />
          <path d="M11 32 Q17 26 23 32 M28 20 H37 M28 26 H35" />
        </g>
      )}
      {name === 'house' && (
        <g {...st}>
          <path d="M8 22 L24 9 L40 22 V39 H8 Z" />
          <path d="M20 39 V28 H28 V39" />
        </g>
      )}
      {name === 'mind' && (
        <g {...st}>
          <circle cx={24} cy={16} r={7} />
          <path d="M11 40 Q11 26 24 26 Q37 26 37 40" />
        </g>
      )}
      {name === 'shield' && (
        <g {...st}>
          <path d="M24 6 L39 12 V23 Q39 35 24 42 Q9 35 9 23 V12 Z" />
          <path d="M17 24 L22 29 L31 19" />
        </g>
      )}
    </svg>
  );
};
