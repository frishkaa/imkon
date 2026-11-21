import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {clamp} from '../anim';
import {Grade, ShotSeq, ShotSpec, seqLength} from '../components/Footage';
import {Caption, CheckMark, Glass, Icon, SceneTag} from '../components/UI';

const SHOTS: ShotSpec[] = [
  {src: 'notary_meeting', d: 250, zoom: [1.0, 1.08], origin: '45% 45%'},
  {src: 'docs_check', d: 100, zoom: [1.0, 1.08]},
];
export const S04_LEN = seqLength(SHOTS);

const CHECKS = [
  {icon: 'id' as const, t: 'Личность', d: 'паспорт, биометрия', at: 50},
  {icon: 'house' as const, t: 'Право собственности', d: 'выписка из реестра', at: 105},
  {icon: 'mind' as const, t: 'Дееспособность', d: 'стороны понимают последствия', at: 160},
];

export const S04Notary: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ShotSeq shots={SHOTS} />
      <Grade top={0.75} bottom={0.6} />
      <SceneTag n={3} title="У нотариуса" />
      {CHECKS.map((c, i) => {
        const p = interpolate(f, [c.at, c.at + 16], [0, 1], clamp);
        return (
          <Glass key={c.t} from={20 + i * 12} style={{left: 96 + i * 588, top: 158, width: 564, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 18}}>
            <Icon name={c.icon} size={48} color={C.goldLight} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 30, fontWeight: 700}}>{c.t}</div>
              <div style={{fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.68)', marginTop: 2}}>{c.d}</div>
            </div>
            <svg width={46} height={46} viewBox="-23 -23 46 46">
              <circle r={21} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
              {p > 0 && <CheckMark r={21} progress={p} />}
            </svg>
          </Glass>
        );
      })}
      <Caption from={10} to={225}>
        Нотариус проверяет стороны и объект — до записи в реестр
      </Caption>
      <Caption from={230} to={S04_LEN} width={1500}>
        За ошибку он отвечает своим имуществом, страховкой и фондом палаты
      </Caption>
    </AbsoluteFill>
  );
};
