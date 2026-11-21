import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {clamp, soft} from '../anim';
import {Grade, Shot} from '../components/Footage';
import {LogoMark} from '../components/Logo';
import {QUOTE, TITLE} from '../data';

export const S10_LEN = 225;
const END = 120; // начало финальной заставки

export const S10Outro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = QUOTE.split(' ');
  const card = interpolate(f, [END - 15, END + 5], [0, 1], clamp);
  const logo = soft(f, fps, END + 4);
  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      <Shot src="family_sunset" zoom={[1.0, 1.06]} />
      <Grade top={0.3} bottom={0.75} />
      <div style={{position: 'absolute', left: 120, right: 120, bottom: 120, color: '#fff', opacity: 1 - card}}>
        <div style={{width: 80, height: 3, background: C.gold, marginBottom: 28, opacity: soft(f, fps, 4)}} />
        <div style={{fontSize: 56, fontWeight: 700, lineHeight: 1.22, letterSpacing: -1, maxWidth: 1500}}>
          {words.map((w, i) => {
            const a = soft(f, fps, 6 + i * 3);
            return (
              <span key={i} style={{display: 'inline-block', marginRight: 16, opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
      <AbsoluteFill style={{background: C.ink, opacity: card, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: logo, transform: `translateY(${(1 - logo) * 20}px)`}}>
          <LogoMark size={130} bg="#1C2A48" />
          <div style={{fontWeight: 800, fontSize: 88, color: '#fff', marginTop: 30, letterSpacing: -2}}>Нотариат</div>
          <div style={{width: 120, height: 3, background: C.gold, marginTop: 26}} />
          <div style={{fontWeight: 500, fontSize: 32, color: 'rgba(255,255,255,0.75)', marginTop: 26}}>{TITLE.subtitle}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
