import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grade, ShotSeq, ShotSpec, XF, seqLength} from '../components/Footage';
import {Callout, Caption, SceneTag} from '../components/UI';

const SHOTS: ShotSpec[] = [
  {src: 'build_timelapse', d: 110, zoom: [1.0, 1.06]},
  {src: 'build_cranes', d: 80, zoom: [1.04, 1.0]},
  {src: 'buyers_hardhats', d: 110, zoom: [1.0, 1.05], origin: '30% 40%'},
  {src: 'meet_developer', d: 85, zoom: [1.02, 1.07]},
  {src: 'handshake', d: 100, zoom: [1.0, 1.06]},
];
export const S02_LEN = seqLength(SHOTS);

// начало каждого кадра внутри сцены
const at = (i: number) => SHOTS.slice(0, i).reduce((s, x) => s + x.d - XF, 0);

export const S02Build: React.FC = () => (
  <AbsoluteFill>
    <ShotSeq shots={SHOTS} />
    <Grade top={0.5} bottom={0.6} />
    <Callout x={640} y={600} label="Покупатели" from={at(2) + 14} to={at(3) + 4} len={120} side="down" />
    <Callout x={1500} y={560} label="Застройщик" from={at(2) + 24} to={at(3) + 4} len={110} side="down" />
    <SceneTag n={1} title="Покупка квартиры" />
    <Caption from={14} to={at(3)}>
      Семья покупает квартиру в строящемся доме
    </Caption>
    <Caption from={at(3) + 6} to={S02_LEN}>
      Стороны договорились — сделку оформят у нотариуса
    </Caption>
  </AbsoluteFill>
);
