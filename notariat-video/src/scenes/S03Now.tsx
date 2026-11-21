import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';
import {soft} from '../anim';
import {Grade, ShotSeq, ShotSpec, seqLength} from '../components/Footage';
import {Caption, Glass, Icon, SceneTag} from '../components/UI';
import {NOW} from '../data';

const SHOTS: ShotSpec[] = [
  {src: 'papers_stack', d: 160, zoom: [1.0, 1.06]},
  {src: 'paperwork', d: 160, zoom: [1.06, 1.0]},
];
export const S03_LEN = seqLength(SHOTS);

const ROWS = [
  {icon: 'budget' as const, t: 'Нотариат содержится из бюджета', d: `Оклады, аренда, содержание — ≈ ${NOW.budgetSpend} в год`, at: 30},
  {icon: 'price' as const, t: 'Цену указывают сами стороны', d: `В договорах — в среднем ≈ ${NOW.contractToMarket}% от рыночной`, at: 85},
  {icon: 'clock' as const, t: 'Налог — после сделки', d: 'Считается постфактум, по декларации', at: 140},
];

export const S03Now: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <ShotSeq shots={SHOTS} />
      <Grade top={0.5} bottom={0.6} left={0.85} />
      <SceneTag n={2} title="Как сейчас" />
      <div style={{position: 'absolute', left: 96, top: 170, width: 900, fontFamily: 'Inter', color: '#fff'}}>
        <div style={{fontSize: 56, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.08, opacity: soft(f, fps, 8)}}>
          Действующая модель:
          <br />
          почему нужны изменения
        </div>
      </div>
      {ROWS.map((r, i) => (
        <Glass key={i} from={r.at} dir="left" style={{left: 96, top: 360 + i * 150, width: 860, padding: '24px 30px', display: 'flex', gap: 26, alignItems: 'center'}}>
          <Icon name={r.icon} size={58} color={C.goldLight} />
          <div>
            <div style={{fontSize: 34, fontWeight: 700, letterSpacing: -0.3}}>{r.t}</div>
            <div style={{fontSize: 25, fontWeight: 500, color: 'rgba(255,255,255,0.72)', marginTop: 4}}>{r.d}</div>
          </div>
        </Glass>
      ))}
      <Caption from={205} to={S03_LEN} accent={C.red}>
        Каждый год бюджет несёт расходы — и недополучает налог
      </Caption>
    </AbsoluteFill>
  );
};
