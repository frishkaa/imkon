import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {ease, soft} from '../anim';
import {Grade, Shot} from '../components/Footage';
import {LogoMark} from '../components/Logo';
import {TITLE} from '../data';

export const S01_LEN = 165;

export const S01Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = TITLE.title.split(' ');
  const rule = ease(f, 30, 70);
  return (
    <AbsoluteFill>
      <Shot src="intro_mountain" zoom={[1.0, 1.08]} />
      <Grade top={0.3} bottom={0.5} left={0.82} />
      <div style={{position: 'absolute', left: 120, top: 300, width: 1100, fontFamily: FONT, color: '#fff'}}>
        <div style={{opacity: soft(f, fps, 8), marginBottom: 40}}>
          <LogoMark size={84} bg="rgba(12,21,40,0.85)" />
        </div>
        <div style={{fontSize: 24, fontWeight: 700, letterSpacing: 5, color: C.goldLight, textTransform: 'uppercase', opacity: soft(f, fps, 16)}}>
          {TITLE.overline}
        </div>
        <div style={{marginTop: 18, fontSize: 108, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3}}>
          {words.map((w, i) => {
            const a = soft(f, fps, 24 + i * 6);
            return (
              <span key={i} style={{display: 'inline-block', marginRight: 28, opacity: a, transform: `translateY(${(1 - a) * 28}px)`}}>
                {w}
              </span>
            );
          })}
        </div>
        <div style={{marginTop: 34, height: 3, width: 160 * rule, background: C.gold}} />
        <div style={{marginTop: 28, fontSize: 32, fontWeight: 500, color: 'rgba(255,255,255,0.85)', opacity: soft(f, fps, 56)}}>{TITLE.subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};
