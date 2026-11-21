import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {clamp, ease, soft} from '../anim';
import {Grade, Shot} from '../components/Footage';
import {Caption, CheckMark, SceneTag} from '../components/UI';
import {LogoMark} from '../components/Logo';
import {DEAL, fmt} from '../data';

export const S05_LEN = 330;
const T0 = 62; // кадр, с которого на экране интерфейс

const profit = Math.max(DEAL.contractPrice, DEAL.referencePrice) - DEAL.previousPrice;
const tax = profit * DEAL.taxRate;
const debtsTotal = DEAL.debts.reduce((s, d) => s + d.amount, 0);

const Row: React.FC<{label: string; value: string; at: number; strong?: boolean}> = ({label, value, at, strong}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = soft(f, fps, at);
  return (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: `1px solid ${C.line}`, opacity: a}}>
      <div style={{fontSize: 25, fontWeight: strong ? 700 : 500, color: strong ? C.ink : C.slate}}>{label}</div>
      <div style={{fontSize: strong ? 30 : 26, fontWeight: 700, color: strong ? C.blue : C.ink, fontVariantNumeric: 'tabular-nums'}}>{value}</div>
    </div>
  );
};

const Bar: React.FC<{label: string; v: number; max: number; color: string; at: number}> = ({label, v, max, color, at}) => {
  const f = useCurrentFrame();
  const t = ease(f, at, at + 28);
  return (
    <div style={{marginBottom: 14}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 500, color: C.slate, marginBottom: 6}}>
        <span>{label}</span>
        <span style={{fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{fmt(v * t)} сомони</span>
      </div>
      <div style={{height: 26, background: C.paper2}}>
        <div style={{width: `${(v / max) * 100 * t}%`, height: '100%', background: color}} />
      </div>
    </div>
  );
};

const PAYS = [
  {label: 'Госпошлина', v: DEAL.stateDuty},
  {label: 'Налог с прибыли', v: tax},
  {label: 'Долги', v: debtsTotal},
  {label: 'Запись', v: DEAL.recordFee},
  {label: 'Нотариус', v: DEAL.notaryFee},
];

const Ui: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const win = soft(f, fps, 0);
  const scanY = interpolate(f, [100, 140], [0, 100], clamp);
  const found = soft(f, fps, 138);
  const unlock = ease(f, 205, 215);
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        top: 138,
        width: 1680,
        height: 724,
        background: '#fff',
        boxShadow: '0 50px 120px rgba(0,0,0,0.45)',
        display: 'flex',
        fontFamily: FONT,
        color: C.ink,
        overflow: 'hidden',
        opacity: win,
        transform: `perspective(2000px) translateY(${(1 - win) * 40}px) scale(${0.94 + win * 0.06})`,
      }}
    >
      <div style={{width: 280, background: C.ink, padding: '30px 26px', color: '#fff'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40}}>
          <LogoMark size={50} bg="#1C2A48" />
          <div style={{fontWeight: 800, fontSize: 25}}>Нотариат</div>
        </div>
        {['Сделки', 'Реестр', 'Платежи', 'Журнал действий', 'Отчёты'].map((m, i) => (
          <div key={m} style={{fontSize: 21, fontWeight: 600, padding: '13px 16px', marginBottom: 4, background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent', borderLeft: i === 0 ? `3px solid ${C.gold}` : '3px solid transparent', color: i === 0 ? '#fff' : 'rgba(255,255,255,0.55)'}}>
            {m}
          </div>
        ))}
        <div style={{marginTop: 50, fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.45}}>Все действия записываются в журнал. Ручные правки сумм запрещены.</div>
      </div>
      <div style={{flex: 1, padding: '28px 40px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 18, borderBottom: `1px solid ${C.line}`}}>
          <div>
            <div style={{fontSize: 18, color: C.muted, fontWeight: 600, letterSpacing: 1}}>СДЕЛКА {DEAL.number}</div>
            <div style={{fontSize: 30, fontWeight: 800, marginTop: 4, letterSpacing: -0.5, whiteSpace: 'nowrap'}}>
              {DEAL.object} · {DEAL.city}
            </div>
          </div>
          <div style={{display: 'flex', gap: 10}}>
            {[`Продавец: ${DEAL.seller}`, `Покупатель: ${DEAL.buyer}`].map((t) => (
              <div key={t} style={{background: C.blueSoft, color: C.blue, fontWeight: 700, fontSize: 16, padding: '7px 12px', whiteSpace: 'nowrap'}}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{display: 'flex', gap: 36, marginTop: 16, flex: 1}}>
          <div style={{flex: 1.15}}>
            <div style={{fontSize: 18, fontWeight: 700, color: C.gold, letterSpacing: 2.5, marginBottom: 14}}>РАСЧЁТ НАЛОГА</div>
            <Bar label="Цена в договоре" v={DEAL.contractPrice} max={DEAL.referencePrice} color={C.slate} at={14} />
            <Bar label="Справочная стоимость" v={DEAL.referencePrice} max={DEAL.referencePrice} color={C.blue} at={26} />
            <div style={{fontSize: 21, fontWeight: 700, color: C.blue, background: C.blueSoft, padding: '8px 14px', display: 'inline-block', opacity: soft(f, fps, 62), marginBottom: 4}}>
              База налога — большая сумма: {fmt(DEAL.referencePrice)}
            </div>
            <Row label="Прежняя цена (покупка продавцом)" value={fmt(DEAL.previousPrice)} at={76} />
            <Row label="Прибыль" value={fmt(profit)} at={86} />
            <Row label={`Налог с прибыли · ${Math.round(DEAL.taxRate * 100)}%`} value={fmt(tax)} at={96} strong />
            <Row label="Госпошлина" value={fmt(DEAL.stateDuty)} at={106} strong />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 18, fontWeight: 700, color: C.gold, letterSpacing: 2.5, marginBottom: 14}}>РЕЕСТР ДОЛЖНИКОВ</div>
            <div style={{position: 'relative', background: C.paper, padding: 20, height: 250, overflow: 'hidden', border: `1px solid ${C.line}`}}>
              {Array.from({length: 6}).map((_, i) => (
                <div key={i} style={{display: 'flex', gap: 12, marginBottom: 16, opacity: 0.7}}>
                  <div style={{width: 26, height: 26, background: '#DCE2EC'}} />
                  <div style={{height: 10, marginTop: 8, background: '#DCE2EC', width: `${55 + (i % 3) * 12}%`}} />
                </div>
              ))}
              {f > 100 && f < 142 && <div style={{position: 'absolute', left: 0, right: 0, top: `${scanY}%`, height: 3, background: C.blue, boxShadow: `0 0 18px ${C.blue}`}} />}
              <div style={{position: 'absolute', inset: 14, background: '#fff', padding: '16px 20px', border: `1px solid ${C.line}`, boxShadow: '0 10px 30px rgba(15,27,51,0.12)', opacity: found}}>
                <div style={{fontSize: 22, fontWeight: 800, color: C.red}}>Найдены долги продавца</div>
                {DEAL.debts.map((d) => (
                  <div key={d.label} style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 500, marginTop: 12}}>
                    <span>{d.label}</span>
                    <span style={{fontWeight: 700}}>{fmt(d.amount)}</span>
                  </div>
                ))}
                <div style={{marginTop: 18, fontSize: 20, fontWeight: 700, color: C.green, background: C.greenSoft, padding: '8px 12px'}}>Погашаются из цены сделки</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14}}>
          {PAYS.map((p, i) => {
            const at = 150 + i * 10;
            const ok = interpolate(f, [at, at + 12], [0, 1], clamp);
            return (
              <div key={p.label} style={{flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: ok > 0.5 ? C.greenSoft : C.paper2, border: `1px solid ${ok > 0.5 ? '#A7D3BC' : 'transparent'}`}}>
                <svg width={30} height={30} viewBox="-15 -15 30 30">
                  {ok > 0 ? <CheckMark r={14} progress={ok} /> : <circle r={12} fill="none" stroke="#C3C9D6" strokeWidth={2.5} />}
                </svg>
                <div>
                  <div style={{fontSize: 16, fontWeight: 600, color: C.muted}}>{p.label}</div>
                  <div style={{fontSize: 20, fontWeight: 800}}>{fmt(p.v)}</div>
                </div>
              </div>
            );
          })}
          <div style={{width: 260, height: 70, background: unlock > 0.5 ? C.green : '#C3C9D6', color: '#fff', fontSize: 23, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
            <svg width={26} height={30} viewBox="0 0 30 34">
              <rect x={3} y={14} width={24} height={18} rx={3} fill="#fff" />
              <path d="M8 14 V9 a7 7 0 0 1 14 0 V14" stroke="#fff" strokeWidth={4} fill="none" transform={unlock > 0.5 ? 'translate(9 -4)' : ''} />
            </svg>
            Подписать акт
          </div>
        </div>
      </div>
    </div>
  );
};

export const S05Platform: React.FC = () => {
  return (
    <AbsoluteFill>
      <Shot
        src="laptop"
        rate={0.3}
        zoom={[1.0, 1.12]}
        origin="70% 60%"
        blur={(x) => interpolate(x, [T0 - 20, T0 + 10], [0, 14], clamp)}
        dim={(x) => interpolate(x, [T0 - 20, T0 + 10], [0, 0.55], clamp)}
      />
      <Grade top={0.5} bottom={0.55} />
      <Sequence from={T0}>
        <Ui />
      </Sequence>
      <SceneTag n={4} title="Платформа «Нотариат»" />
      <Caption from={8} to={T0 + 145} width={1700} bottom={52}>
        Платформа сама считает пошлину и налог, сверяет цену и проверяет долги
      </Caption>
      <Caption from={T0 + 150} to={S05_LEN} bottom={52}>
        Сделка оформляется только после всех платежей
      </Caption>
    </AbsoluteFill>
  );
};
