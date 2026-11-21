import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {ease, soft} from '../anim';
import {Grade, Shot} from '../components/Footage';
import {Glass, SceneTag} from '../components/UI';
import {CITIES, MAP_H, MAP_W, TJ_PATH} from '../mapData';
import {PILOT} from '../data';

export const S09_LEN = 255;
const LABEL_SIDE: Record<string, 'l' | 'r'> = {Душанбе: 'l', Худжанд: 'r', Бохтар: 'l', Куляб: 'r'};

export const S09Pilot: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = ease(f, 5, 60);
  const fill = ease(f, 45, 75);
  const S = 0.9;
  const stats = [
    {big: PILOT.years, small: 'пилот в четырёх городах'},
    {big: `${PILOT.notaries}`, small: 'лицензированных нотариусов на первом этапе'},
    {big: '0', small: 'сомони бюджета на их содержание'},
  ];
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: '#fff'}}>
      <Shot src="mountain_bg" zoom={[1.08, 1.0]} blur={4} dim={0.6} />
      <Grade top={0.5} bottom={0.4} right={0.5} />
      <SceneTag n={8} title="Предложение: пилот" />
      <svg width={MAP_W * S + 80} height={MAP_H * S + 80} style={{position: 'absolute', left: 60, top: 190}} viewBox={`-40 -40 ${MAP_W + 80} ${MAP_H + 80}`}>
        <path d={TJ_PATH} fill="#fff" fillOpacity={0.1 * fill} stroke="#fff" strokeWidth={3.5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        {CITIES.map((c, i) => {
          const a0 = 70 + i * 16;
          const p = ease(f, a0, a0 + 14);
          const side = LABEL_SIDE[c.name];
          const ring = Math.max(0, ((f - a0) % 45) / 45);
          return (
            <g key={c.name} transform={`translate(${c.x} ${c.y})`} opacity={p}>
              {f > a0 && <circle r={10 + ring * 34} fill="none" stroke={C.goldLight} strokeWidth={2.5} opacity={1 - ring} />}
              <circle r={11} fill={C.goldLight} />
              <circle r={4.5} fill={C.ink} />
              <text x={side === 'l' ? -24 : 24} y={10} textAnchor={side === 'l' ? 'end' : 'start'} fontFamily="Inter" fontWeight={700} fontSize={34} fill="#fff">
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', right: 96, top: 180, width: 760}}>
        {stats.map((s, i) => (
          <Glass key={i} from={110 + i * 18} dir="right" style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 28, padding: '20px 30px', marginBottom: 18}}>
            <div style={{fontWeight: 800, fontSize: 62, color: C.goldLight, minWidth: 200, letterSpacing: -1}}>{s.big}</div>
            <div style={{fontSize: 28, fontWeight: 600, lineHeight: 1.25}}>{s.small}</div>
          </Glass>
        ))}
        <div style={{marginTop: 22, fontSize: 26, fontWeight: 500, lineHeight: 1.4, color: 'rgba(255,255,255,0.85)', opacity: soft(f, fps, 175), borderLeft: `4px solid ${C.gold}`, paddingLeft: 20}}>
          Государственные и лицензированные нотариусы — в одних городах, на одной платформе, по одним тарифам. По итогам — независимая оценка.
        </div>
      </div>
    </AbsoluteFill>
  );
};
