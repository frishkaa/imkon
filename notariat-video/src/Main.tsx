import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {S01Intro, S01_LEN} from './scenes/S01Intro';
import {S02Build, S02_LEN} from './scenes/S02Build';
import {S03Now, S03_LEN} from './scenes/S03Now';
import {S04Notary, S04_LEN} from './scenes/S04Notary';
import {S05Platform, S05_LEN} from './scenes/S05Platform';
import {S06Money, S06_LEN} from './scenes/S06Money';
import {S07Docs, S07_LEN} from './scenes/S07Docs';
import {S08Budget, S08_LEN} from './scenes/S08Budget';
import {S09Pilot, S09_LEN} from './scenes/S09Pilot';
import {S10Outro, S10_LEN} from './scenes/S10Outro';

const T = 15; // длина наплыва между сценами, кадров

export const SCENES: {name: string; d: number; C: React.FC}[] = [
  {name: 'Заставка', d: S01_LEN, C: S01Intro},
  {name: 'Покупка квартиры', d: S02_LEN, C: S02Build},
  {name: 'Как сейчас', d: S03_LEN, C: S03Now},
  {name: 'У нотариуса', d: S04_LEN, C: S04Notary},
  {name: 'Платформа', d: S05_LEN, C: S05Platform},
  {name: 'Движение денег', d: S06_LEN, C: S06Money},
  {name: 'Документы', d: S07_LEN, C: S07Docs},
  {name: 'Бюджет', d: S08_LEN, C: S08Budget},
  {name: 'Пилот', d: S09_LEN, C: S09Pilot},
  {name: 'Финал', d: S10_LEN, C: S10Outro},
];

export const TOTAL = SCENES.reduce((s, x) => s + x.d, 0) - (SCENES.length - 1) * T;

export const Main: React.FC = () => (
  <AbsoluteFill style={{background: '#0B1222'}}>
    <TransitionSeries>
      {SCENES.flatMap((s, i) => {
        const items = [];
        if (i > 0) {
          items.push(<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={linearTiming({durationInFrames: T})} />);
        }
        items.push(
          <TransitionSeries.Sequence key={s.name} name={s.name} durationInFrames={s.d}>
            <s.C />
          </TransitionSeries.Sequence>,
        );
        return items;
      })}
    </TransitionSeries>
    <Audio src={staticFile('music.wav')} volume={(f) => Math.min(1, f / 20) * Math.min(1, (TOTAL - f) / 60) * 0.85} />
  </AbsoluteFill>
);
