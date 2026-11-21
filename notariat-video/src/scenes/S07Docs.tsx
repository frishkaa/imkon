import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';
import {clamp, soft} from '../anim';
import {Grade, ShotSeq, ShotSpec, XF, seqLength} from '../components/Footage';
import {Caption, Glass, SceneTag} from '../components/UI';

const SHOTS: ShotSpec[] = [
  {src: 'stamp', d: 105, zoom: [1.0, 1.06], origin: '40% 60%'},
  {src: 'signature', d: 80, zoom: [1.0, 1.08]},
  {src: 'folder', d: 95, zoom: [1.0, 1.05]},
  {src: 'keys_hardhats', d: 110, zoom: [1.0, 1.06], origin: '55% 45%'},
  {src: 'keys_show', d: 80, zoom: [1.02, 1.08]},
];
export const S07_LEN = seqLength(SHOTS);
const at = (i: number) => SHOTS.slice(0, i).reduce((s, x) => s + x.d - XF, 0);

/** Плашка «Акт удостоверен» с печатью */
const Seal: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = soft(f, fps, from);
  const out = interpolate(f, [to - 10, to], [1, 0], clamp);
  const ring = interpolate(f, [from, from + 26], [0.6, 1.5], clamp);
  return (
    <Glass from={from} dir="right" style={{right: 96, top: 150, padding: '22px 30px', display: 'flex', alignItems: 'center', gap: 22, opacity: Math.min(a, out)}}>
      <svg width={70} height={70} viewBox="-35 -35 70 70">
        <circle r={30 * ring} fill="none" stroke={C.goldLight} strokeWidth={2} opacity={interpolate(ring, [0.6, 1.5], [0.8, 0])} />
        <circle r={26} fill="none" stroke={C.goldLight} strokeWidth={3} />
        <circle r={19} fill="none" stroke={C.goldLight} strokeWidth={1.5} strokeDasharray="3 3" />
        <path d="M-9 0 L-3 6 L10 -7" stroke={C.goldLight} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <div style={{fontSize: 20, fontWeight: 700, letterSpacing: 3, color: C.goldLight}}>НОТАРИАЛЬНЫЙ АКТ</div>
        <div style={{fontSize: 32, fontWeight: 800, marginTop: 2}}>Удостоверен · запись в реестре</div>
      </div>
    </Glass>
  );
};

export const S07Docs: React.FC = () => (
  <AbsoluteFill>
    <ShotSeq shots={SHOTS} />
    <Grade top={0.55} bottom={0.6} />
    <SceneTag n={6} title="Документы на руках" />
    <Seal from={48} to={at(2) + 10} />
    <Caption from={10} to={at(2)}>
      Сделка подписана и удостоверена нотариусом
    </Caption>
    <Caption from={at(2) + 6} to={S07_LEN} width={1500}>
      Документы и ключи — у новых владельцев. Налог уже поступил в бюджет
    </Caption>
  </AbsoluteFill>
);
