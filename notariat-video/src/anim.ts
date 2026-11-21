import {Easing, interpolate, spring} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Плавная кривая без отскока — основной «серьёзный» easing */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 между кадрами a и b (in-out) */
export const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: EASE_IO});

/** 0→1 между кадрами a и b (быстрый старт, мягкая остановка) */
export const easeOut = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: EASE});

/** Появление: мягкая пружина почти без перелёта */
export const pop = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 30, mass: 0.9, stiffness: 110}});

/** Появление без перелёта */
export const soft = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: 24});

export const deg = (d: number) => (d * Math.PI) / 180;
