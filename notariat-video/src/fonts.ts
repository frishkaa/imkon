import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const LAT =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

const faces: {family: string; file: string; weight: string}[] = [
  ...['400', '500', '600', '700', '800'].map((w) => ({family: 'Inter', file: 'inter', weight: w})),
];

export const fontsReady = Promise.all(
  faces.flatMap((f) => [
    loadFont({family: f.family, weight: f.weight, unicodeRange: CYR, url: staticFile(`fonts/${f.file}-cyrillic-${f.weight}-normal.woff2`)}),
    loadFont({family: f.family, weight: f.weight, unicodeRange: LAT, url: staticFile(`fonts/${f.file}-latin-${f.weight}-normal.woff2`)}),
  ]),
);
