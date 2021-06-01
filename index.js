// Import stylesheets
import './style.css';

const isHome =
  typeof window.entry !== 'undefined' &&
  typeof window.entry.section !== 'undefined' &&
  window.entry.section === 'home';

window.APP = {
  devMode: typeof window.devMode !== 'undefined' ? window.devMode : true,
  isHome: isHome,
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  winWidth: window.innerWidth,
  mqMedium: 768,
  mqLarge: 1024,
  reducedMotion: false,

  settings: {
    // BG Related
    bgMaxReach: 1.3,
    bgEase: isHome ? 0.01 : 0.005,
    bgOscAmp: 200,
    bgOscPeriod: 1200
  },

  isMqSmall: () => APP.winWidth < APP.mqMedium,
  isMqMedium: () => APP.winWidth < APP.mqLarge
};

// import { PIXI } from 'pixi';
import * as PIXI from 'pixi.js';
import Gui from '@malven/gui';

window.APP = {};

APP.gui = new Gui();

// Javascript
import Footer from './Footer';

let footer;

// Footer
footer = new Footer(PIXI);

footer.start();
