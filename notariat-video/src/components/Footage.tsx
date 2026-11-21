import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {clamp} from '../anim';

/** Один кадр из стокового видео: медленный «наезд», цветокор, затемнение/размытие */
export const Shot: React.FC<{
  src: string;
  zoom?: [number, number];
  origin?: string;
  dim?: number | ((f: number) => number);
  blur?: number | ((f: number) => number);
  rate?: number;
}> = ({src, zoom = [1.0, 1.07], origin = '50% 50%', dim = 0, blur = 0, rate = 1}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const z = interpolate(f, [0, durationInFrames], zoom, clamp);
  const d = typeof dim === 'function' ? dim(f) : dim;
  const b = typeof blur === 'function' ? blur(f) : blur;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#0B1222'}}>
      <OffthreadVideo
        src={staticFile(`footage/${src}.mp4`)}
        muted
        playbackRate={rate}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${z + b * 0.004})`,
          transformOrigin: origin,
          filter: `saturate(0.92) contrast(1.04) brightness(0.98)${b ? ` blur(${b}px)` : ''}`,
        }}
      />
      {d > 0 && <AbsoluteFill style={{background: `rgba(10,18,36,${d})`}} />}
    </AbsoluteFill>
  );
};

export type ShotSpec = {src: string; d: number; zoom?: [number, number]; origin?: string; rate?: number};

export const XF = 8; // короткий наплыв между кадрами внутри сцены

export const seqLength = (shots: ShotSpec[]) => shots.reduce((s, x) => s + x.d, 0) - (shots.length - 1) * XF;

/** Монтажная последовательность кадров с короткими наплывами */
export const ShotSeq: React.FC<{shots: ShotSpec[]}> = ({shots}) => (
  <TransitionSeries>
    {shots.flatMap((s, i) => {
      const out = [];
      if (i > 0) out.push(<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={linearTiming({durationInFrames: XF})} />);
      out.push(
        <TransitionSeries.Sequence key={`${s.src}${i}`} durationInFrames={s.d} name={s.src}>
          <Shot src={s.src} zoom={s.zoom} origin={s.origin} rate={s.rate} />
        </TransitionSeries.Sequence>,
      );
      return out;
    })}
  </TransitionSeries>
);

/** Затемнение сверху/снизу/слева для читаемости графики */
export const Grade: React.FC<{top?: number; bottom?: number; left?: number; right?: number; all?: number}> = ({top = 0.45, bottom = 0.55, left = 0, right = 0, all = 0}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {all > 0 && <AbsoluteFill style={{background: `rgba(10,18,36,${all})`}} />}
    {top > 0 && <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(10,18,36,${top}) 0%, rgba(10,18,36,0) 28%)`}} />}
    {bottom > 0 && <AbsoluteFill style={{background: `linear-gradient(0deg, rgba(10,18,36,${bottom}) 0%, rgba(10,18,36,0) 34%)`}} />}
    {left > 0 && <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(10,18,36,${left}) 0%, rgba(10,18,36,${left * 0.6}) 35%, rgba(10,18,36,0) 62%)`}} />}
    {right > 0 && <AbsoluteFill style={{background: `linear-gradient(270deg, rgba(10,18,36,${right}) 0%, rgba(10,18,36,${right * 0.6}) 35%, rgba(10,18,36,0) 62%)`}} />}
  </AbsoluteFill>
);
