import React from 'react';
import {C, FONT} from '../theme';

/** Знак платформы «Нотариат»: лист + печать */
export const LogoMark: React.FC<{size?: number; bg?: string}> = ({size = 120, bg = C.ink}) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect x={0} y={0} width={120} height={120} rx={18} fill={bg} />
    <rect x={32} y={22} width={48} height={64} fill="#fff" />
    <rect x={40} y={34} width={30} height={3} fill={bg} opacity={0.35} />
    <rect x={40} y={43} width={32} height={3} fill={bg} opacity={0.35} />
    <rect x={40} y={52} width={22} height={3} fill={bg} opacity={0.35} />
    <circle cx={78} cy={80} r={19} fill={bg} />
    <circle cx={78} cy={80} r={15} fill="none" stroke={C.goldLight} strokeWidth={3} />
    <circle cx={78} cy={80} r={9} fill="none" stroke={C.goldLight} strokeWidth={1.5} strokeDasharray="2 2" />
  </svg>
);

export const LogoLockup: React.FC<{size?: number; color?: string}> = ({size = 90, color = C.ink}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.28}}>
    <LogoMark size={size} />
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size * 0.55, color, letterSpacing: -1}}>Нотариат</div>
  </div>
);
