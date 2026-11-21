import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {clamp, ease, soft} from '../anim';
import {Grade, Shot} from '../components/Footage';
import {Glass, SceneTag} from '../components/UI';
import {EFFECTS, EFFECTS_FOOTNOTE, EFFECTS_UNIT} from '../data';

export const S08_LEN = 285;
const total = EFFECTS.reduce((s, e) => s + e.value, 0);
const maxV = Math.max(...EFFECTS.map((e) => e.value));

export const S08Budget: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flip = ease(f, 40, 62);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: '#fff'}}>
      <Shot src="night_city" zoom={[1.0, 1.08]} blur={3} dim={0.55} />
      <Grade top={0.5} bottom={0.5} left={0.6} />
      <SceneTag n={7} title="Эффект для бюджета" />
      {/* слева — главный тезис */}
      <div style={{position: 'absolute', left: 96, top: 190, width: 720}}>
        <div style={{fontSize: 26, fontWeight: 700, letterSpacing: 3, color: C.goldLight, opacity: soft(f, fps, 6)}}>БЮДЖЕТ</div>
        <div style={{fontSize: 70, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, marginTop: 14, opacity: soft(f, fps, 10)}}>
          <div style={{color: interpolate(flip, [0, 1], [1, 0.45]) > 0.7 ? '#fff' : 'rgba(255,255,255,0.45)', textDecoration: flip > 0.5 ? 'line-through' : 'none', textDecorationColor: C.red}}>
            из плательщика
          </div>
          <div style={{color: C.goldLight, opacity: 0.25 + flip * 0.75}}>в получателя</div>
        </div>
        <div style={{marginTop: 34, fontSize: 28, fontWeight: 500, lineHeight: 1.4, color: 'rgba(255,255,255,0.82)', opacity: soft(f, fps, 70)}}>
          Лицензированных нотариусов бюджет не содержит, а налог получает в момент сделки. Система работает на взносах нотариата — без бюджетных денег.
        </div>
      </div>
      {/* справа — показатели */}
      <Glass from={60} dir="right" style={{right: 96, top: 170, width: 900, padding: '30px 36px 26px'}}>
        <div style={{fontSize: 20, fontWeight: 700, letterSpacing: 2.5, color: C.goldLight}}>ЧИСТАЯ ВЫГОДА, {EFFECTS_UNIT.toUpperCase()}*</div>
        {EFFECTS.map((e, i) => {
          const a0 = 80 + i * 20;
          const g = ease(f, a0, a0 + 30);
          return (
            <div key={e.n} style={{marginTop: 20, opacity: soft(f, fps, a0)}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8}}>
                <div style={{fontSize: 27, fontWeight: 700}}>
                  {e.label}
                  <span style={{fontSize: 20, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: 12}}>{e.note}</span>
                </div>
                <div style={{fontSize: 30, fontWeight: 800, fontVariantNumeric: 'tabular-nums'}}>+{Math.round(e.value * g)}</div>
              </div>
              <div style={{height: 10, background: 'rgba(255,255,255,0.12)'}}>
                <div style={{height: '100%', width: `${(e.value / maxV) * 100 * g}%`, background: C.goldLight}} />
              </div>
            </div>
          );
        })}
        <div style={{marginTop: 28, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: soft(f, fps, 175)}}>
          <div style={{fontSize: 26, fontWeight: 600, lineHeight: 1.3}}>
            Итого — при нулевых
            <br />
            затратах бюджета
          </div>
          <div style={{fontSize: 72, fontWeight: 800, color: C.goldLight, letterSpacing: -2, fontVariantNumeric: 'tabular-nums'}}>
            ≈ {Math.round(total * interpolate(f, [175, 210], [0, 1], clamp))} <span style={{fontSize: 28, color: '#fff'}}>млн</span>
          </div>
        </div>
        <div style={{marginTop: 10, fontSize: 18, color: 'rgba(255,255,255,0.55)'}}>{EFFECTS_FOOTNOTE}</div>
      </Glass>
      <Glass from={215} style={{left: 96, bottom: 72, width: 760, padding: '18px 26px', fontSize: 23, fontWeight: 500, lineHeight: 1.4}}>
        <span style={{color: C.goldLight, fontWeight: 700}}>Франция, 2024:</span> нотариусы собрали для бюджета <b>€36,15 млрд</b> — без затрат государства на сбор
      </Glass>
    </AbsoluteFill>
  );
};
