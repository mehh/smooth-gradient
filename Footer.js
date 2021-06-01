import footerFrag from './shaders/footer_frag.js';

/**
 * Footer element for animation
 *
 * @class    Footer
 * @param    {object}  options  Options for the object
 * @return   {object}  The object
 */
const Footer = function(PIXI, options = {}) {
  //
  //   Public Vars
  //
  //////////////////////////////////////////////////////////////////////

  let self = Object.assign(
    {},
    {
      app: null,
      wrapperWidth: 2000,
      wrapperHeight: 1000,
      settings: {
        timeSpeed: 1.3,

        blurAmount: 60,
        blurQuality: 2,
        noiseAmount: 0.03,
        enableBlur: true,
        enableNoise: true,
        fuzzyNoise: false,
        xyScalar: 0.003,
        noiseOffset: 0.0005,
        noiseSpeed: 1.1,
        blendLow: 0,
        blendHigh: 1,
        fractalNoise: false,
        color1: '#fffff1',
        color2: '#72dbd3',
        color3: '#5788f4',
        color4: '#be98ce',
        color5: '#f0ebf4'
      }
    },
    options
  );

  //
  //   Private Vars
  //
  //////////////////////////////////////////////////////////////////////

  const canvasContainer = document.querySelector('[data-footer]');

  let app;
  let wrapper;

  let shaderFilter;
  let blurFilter;
  let noiseFilter;

  let time = 0;
  let noiseIter = 0;

  let mouseTarget = [0, 0];
  let mouse = [0, 0];

  const uniformSettings = [
    'xyScalar',
    'noiseOffset',
    'noiseSpeed',
    'blendLow',
    'blendHigh',
    'fractalNoise',
    'color1',
    'color2',
    'color3',
    'color4',
    'color5'
  ];

  //
  //   Private Methods
  //
  //////////////////////////////////////////////////////////////////////

  const _init = () => {
    _addGui();
    _createRenderer();
    _createItems();
    _addEventListeners();
    _getShader();
    _updateValues();
    _setGlobalMethods();
  };

  const _addGui = () => {
    if (!APP.devMode) return;
    APP.gui.setFolder('Footer');

    // APP.gui.add(self.settings, 'timeSpeed', 005, 5).step(005);
    APP.gui.add(self.settings, 'blurAmount', 0, 1000);
    APP.gui.add(self.settings, 'blurQuality', 1, 100);
    APP.gui.add(self.settings, 'noiseAmount', 0.001, 0.2);
    APP.gui.add(self.settings, 'enableBlur');
    APP.gui.add(self.settings, 'enableNoise');
    APP.gui.add(self.settings, 'fuzzyNoise');

    APP.gui.add(self.settings, 'xyScalar', 0.001, 0.01);
    APP.gui.add(self.settings, 'noiseOffset', 0.0001, 0.003);
    APP.gui.add(self.settings, 'noiseSpeed', 0.0001, 4.0);
    APP.gui.add(self.settings, 'blendLow', 0, 1);
    APP.gui.add(self.settings, 'blendHigh', 0, 1);
    APP.gui.add(self.settings, 'fractalNoise');

    APP.gui.addColor(self.settings, 'color1').onChange(_setTexture);
    APP.gui.addColor(self.settings, 'color2').onChange(_setTexture);
    APP.gui.addColor(self.settings, 'color3').onChange(_setTexture);
    APP.gui.addColor(self.settings, 'color4').onChange(_setTexture);
    APP.gui.addColor(self.settings, 'color5').onChange(_setTexture);
  };

  var _addEventListeners = function() {
    app.ticker.add(_update);
    window.addEventListener('mousemove', _onMouseMove);
  };

  var _createRenderer = function() {
    app = new PIXI.Application({
      antialias: false,
      forceFXAA: false,
      backgroundColor: 0xecede8,
      resizeTo: canvasContainer
    });
    canvasContainer.appendChild(app.view);
  };

  var _onMouseMove = function(evt) {
    self.targetX = evt.offsetX;
    self.targetY = evt.offsetY;
  };

  var _createItems = function() {
    // Wrapper
    wrapper = new PIXI.Sprite();
    _setTexture();
    wrapper.width = app.screen.width;
    wrapper.height = app.screen.height;
    document.addEventListener('mousemove', evt => {
      mouseTarget = [evt.clientX, evt.clientY];
    });

    // Add it to the screen
    app.stage.addChild(wrapper);

    // Immediately stop, we only want to animate this when in view
    self.stop();

    // Render once just to have something to look at
    app.render();
  };

  const _setTexture = () => {
    const texture = _createGradTexture();
    wrapper.texture = texture;
  };

  var _getShader = function() {
    // Shader
    shaderFilter = new PIXI.Filter(null, footerFrag, {
      time: time,
      noiseIter: noiseIter,
      xyScalar: self.settings.xyScalar,
      noiseOffset: self.settings.noiseOffset,
      blendLow: self.settings.blendLow,
      blendHigh: self.settings.blendHigh,
      fractalNoise: self.settings.fractalNoise,
      resolution: [app.screen.width, app.screen.height],
      mouse: mouse,

      color1: self.settings.color1,
      color2: self.settings.color2,
      color3: self.settings.color3,
      color4: self.settings.color4,
      color5: self.settings.color5
    });

    // Blur
    blurFilter = new PIXI.filters.BlurFilter(70, 8, 1, 5);
    blurFilter.autoFit = true;

    // Noise
    noiseFilter = new PIXI.filters.NoiseFilter(self.settings.noiseAmount);

    // Add filters
    wrapper.filters = [shaderFilter, blurFilter, noiseFilter];
  };

  const _update = () => {
    // Update time/iteration
    time += self.settings.timeSpeed;
    noiseIter += self.settings.noiseSpeed;

    // Resize wrapper to fit screen
    wrapper.width = app.screen.width;
    wrapper.height = app.screen.height;

    // Update blur
    blurFilter.blur = self.settings.enableBlur ? self.settings.blurAmount : 0;
    blurFilter.quality = self.settings.blurQuality;

    //Update noise
    noiseFilter.noise = self.settings.enableNoise
      ? self.settings.noiseAmount
      : 0;
    noiseFilter.seed = self.settings.fuzzyNoise ? Math.random() : 0.3;

    // Update uniforms
    shaderFilter.uniforms.time = time;
    shaderFilter.uniforms.noiseIter = noiseIter;
    shaderFilter.uniforms.resolution = [app.screen.width, app.screen.height];
    shaderFilter.uniforms.mouse = mouse;
    uniformSettings.forEach(name => {
      shaderFilter.uniforms[name] = self.settings[name];
    });
  };

  const _updateValues = () => {
    // Update mouse
    const mouseChangeX = (mouseTarget[0] - mouse[0]) * 0.03;
    const mouseChangeY = (mouseTarget[1] - mouse[1]) * 0.03;
    mouse = [mouse[0] + mouseChangeX, mouse[1] + mouseChangeY];

    window.requestAnimationFrame(_updateValues);
  };

  const _createGradTexture = () => {
    // adjust it if somehow you need better quality for very very big images
    const quality = 512;
    const canvas = document.createElement('canvas');
    canvas.width = quality;
    canvas.height = 1;

    const ctx = canvas.getContext('2d');

    // use canvas2d API to create gradient
    const grd = ctx.createLinearGradient(0, 0, quality, 0);
    for (var idx = 0, length = 5; idx < length; idx++) {
      grd.addColorStop(
        (1 / length) * (idx + 1),
        self.settings['color' + (idx + 1)]
      );
    }

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, quality, 1);

    return PIXI.Texture.from(canvas);
  };

  const _setGlobalMethods = () => {
    window.stopFooter = self.stop;
    window.startFooter = self.start;
  };

  //
  //   Public Methods
  //
  //////////////////////////////////////////////////////////////////////

  self.stop = () => {
    app.stop();
  };

  self.start = () => {
    app.start();
  };

  //
  //   Initialize
  //
  //////////////////////////////////////////////////////////////////////

  _init();

  // Return the Object
  return self;
};

export default Footer;
