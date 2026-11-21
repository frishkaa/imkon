import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {Main, TOTAL} from './Main';
import {FPS, H, W} from './theme';
import {fontsReady} from './fonts';

const handle = delayRender('Загрузка шрифтов');
fontsReady.then(() => continueRender(handle));

export const RemotionRoot: React.FC = () => (
  <Composition id="Notariat" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
