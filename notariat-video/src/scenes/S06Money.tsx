import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {C, FONT, H, W} from '../theme';
import {clamp, ease} from '../anim';
import {Grade, Shot} from '../components/Footage';
import {Caption, Pulse, SceneTag} from '../components/UI';
import {LogoMark} from '../components/Logo';
import {DEAL, fmt} from '../data';

export const S06_LEN = 330;
const T0 = 96;

const profit = Math.max(DEAL.contractPrice, DEAL.referencePrice) - DEAL.previousPrice;
const tax = profit * DEAL.taxRate;
const debts = DEAL.debts.reduce((s, d) => s + d.amount, 0);

const RECIP = [
  {t: 'Бюджет: госпошлина', d: '100% — как и сейчас', v: DEAL.stateDuty, budget: true},
  {t: 'Бюджет: налог с прибыли', d: '100% — до подписания акта', v: tax, budget: true},
  {t: 'Взыскатели: долги участника', d: 'коммунальные, энергия — из цены', v: debts},
  {t: 'Оператор платформы', d: 'плата за запись', v: DEAL.recordFee},
  {t: 'Нотариус: правовые услуги', d: 'по тарифу; с дохода — налог в бюджет', v: DEAL.notaryFee},
];
const TOTAL_PAY = RECIP.reduce((s, r) => s + r.v, 0);

const RX = 1180;
const RW = 640;
const RH = 120;
const RY0 = 170;
const RSTEP = 138;
const MID = {x: 590, y: 400, w: 400, h: 200};
const LEFT = {x: 96, y: 390, w: 380, h: 220};
const CY = MID.y + MID.h / 2;

const branch = (cy: number) => {
  const x0 = MID.x + MID.w;
  const xt = 1090;
  const r = 20;
  if (Math.abs(cy - CY) < 2) return `M${x0} ${CY} L${RX} ${CY}`;
  const dir = cy > CY ? 1 : -1;
  return `M${x0} ${CY} L${xt - r} ${CY} Q${xt} ${CY} ${xt} ${CY + dir * r} L${xt} ${cy - dir * r} Q${xt} ${cy} ${xt + r} ${cy} L${RX} ${cy}`;
};
const FEED = `M${LEFT.x + LEFT.w} ${CY} L${MID.x} ${CY}`;

const card: React.CSSProperties = {position: 'absolute', background: 'rgba(255,255,255,0.96)', fontFamily: FONT, color: C.ink, boxSizing: 'border-box', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'};

const Mover: React.FC<{path: string; t: number}> = ({path, t}) => {
  if (t <= 0 || t >= 1) return null;
  const p = getPointAtLength(path, getLength(path) * t);
  if (!p) return null;
  return (
    <g transform={`translate(${p.x} ${p.y})`} opacity={interpolate(t, [0, 0.08, 0.92, 1], [0, 1, 1, 0])}>
      <Pulse r={7} />
    </g>
  );
};

const Diagram: React.FC = () => {
  const f = useCurrentFrame();
  const inA = (d: number) => ease(f, d, d + 16);
  const pay = ease(f, 20, 50);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <path d={FEED} stroke="rgba(255,255,255,0.45)" strokeWidth={2.5} fill="none" opacity={inA(10)} />
        {RECIP.map((r, i) => {
          const p = branch(RY0 + i * RSTEP + RH / 2);
          const L = getLength(p);
          const dr = ease(f, 20 + i * 4, 48 + i * 4);
          return <path key={i} d={p} stroke="rgba(255,255,255,0.45)" strokeWidth={2.5} fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - dr)} />;
        })}
      </svg>
      <div style={{...card, left: LEFT.x, top: LEFT.y, width: LEFT.w, height: LEFT.h, padding: '24px 28px', opacity: inA(0), borderTop: `3px solid ${C.gold}`}}>
        <div style={{fontSize: 32, fontWeight: 800}}>Одна оплата</div>
        <div style={{fontSize: 22, color: C.muted, fontWeight: 500, marginTop: 6}}>госпошлина, налог, долги, услуги</div>
        <div style={{fontSize: 44, fontWeight: 800, color: C.ink, marginTop: 22, fontVariantNumeric: 'tabular-nums'}}>
          {fmt(TOTAL_PAY * pay)} <span style={{fontSize: 24, color: C.muted}}>сомони</span>
        </div>
      </div>
      <div style={{...card, left: MID.x, top: MID.y, width: MID.w, height: MID.h, padding: '24px 28px', opacity: inA(8), background: C.ink, color: '#fff', borderTop: `3px solid ${C.gold}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <LogoMark size={50} bg="#1C2A48" />
          <div style={{fontSize: 28, fontWeight: 800}}>Платформа «Нотариат»</div>
        </div>
        <div style={{fontSize: 22, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: 18, lineHeight: 1.35}}>
          расчёт и распределение
          <br />
          через Казначейство
        </div>
      </div>
      {RECIP.map((r, i) => {
        const at = 60 + i * 20;
        const got = ease(f, at + 20, at + 36);
        return (
          <div
            key={i}
            style={{
              ...card,
              left: RX,
              top: RY0 + i * RSTEP,
              width: RW,
              height: RH,
              padding: '18px 26px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: inA(14 + i * 5),
              borderLeft: `5px solid ${r.budget ? C.blue : C.line}`,
              background: r.budget && got > 0.5 ? '#EEF3FB' : 'rgba(255,255,255,0.96)',
            }}
          >
            <div>
              <div style={{fontSize: 27, fontWeight: 800}}>{r.t}</div>
              <div style={{fontSize: 20, color: C.muted, fontWeight: 500, marginTop: 4}}>{r.d}</div>
            </div>
            <div style={{fontSize: 30, fontWeight: 800, color: got > 0 ? (r.budget ? C.blue : C.ink) : '#C3C9D6', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{fmt(r.v * got)}</div>
          </div>
        );
      })}
      <svg width={W} height={H} style={{position: 'absolute', pointerEvents: 'none'}}>
        {[0, 1, 2].map((k) => (
          <Mover key={`f${k}`} path={FEED} t={interpolate(f, [26 + k * 8, 54 + k * 8], [0, 1], clamp)} />
        ))}
        {RECIP.map((r, i) => {
          const p = branch(RY0 + i * RSTEP + RH / 2);
          const at = 60 + i * 20;
          return [0, 1].map((k) => <Mover key={`${i}-${k}`} path={p} t={interpolate(f, [at + k * 6, at + 24 + k * 6], [0, 1], clamp)} />);
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const S06Money: React.FC = () => {
  const f = useCurrentFrame();
  const bgIn = interpolate(f, [T0 - 16, T0], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={T0 + 4}>
        <Shot src="payment" zoom={[1.0, 1.08]} />
      </Sequence>
      <AbsoluteFill style={{opacity: bgIn}}>
        <Shot src="crowd" zoom={[1.06, 1.0]} blur={12} dim={0.62} />
      </AbsoluteFill>
      <Grade top={0.5} bottom={0.55} />
      <Sequence from={T0}>
        <Diagram />
      </Sequence>
      <SceneTag n={5} title="Движение денег по одной сделке" />
      <Caption from={8} to={T0 + 130}>
        Гражданин платит один раз — платформа сама распределяет суммы
      </Caption>
      <Caption from={T0 + 135} to={S06_LEN} width={1640}>
        Нотариус не держит бюджетные деньги. Каждая строка — в квитанции и в налоговой
      </Caption>
    </AbsoluteFill>
  );
};
