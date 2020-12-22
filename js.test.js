/**
 * @typedef {Object} GlobalScope
 * @property {Window} win
 * @property {Document} doc
 * @property {Navigator} nav
 */

class EventModule {
  async start(scope, readinessCallback) {
    throw new Error("Need to implement method");
  }

  async stop() {
    throw new Error("Need to implement method");
  }
}

class ExecModule {
  /**
   * @param {GlobalScope} scope
   * @return {Promise<{}>}
   */
  async exec(scope) {
    throw new Error("Need to implement method");
  }
}

class Queue {
  /**
   * @param {string} name
   * @param {GlobalScope} scope
   * @param {function} readinessCallback
   */
  constructor(name, scope, readinessCallback) {
    this.name = name;
    this.readinessCallback = readinessCallback;
    this.scope = scope;
    this.queue = [];
  }

  /**
   * @param {ExecModule|EventModule} module
   * @param {number} [timeout]
   */
  add(module, timeout = 0) {
    if (!(module instanceof ExecModule) && !(module instanceof EventModule)) {
      throw Error("Module is not supported. One of ExecModule or EventModule instance is expected.")
    }
    this.queue.push({ module, timeout });
  }

  start() {
    let timeout = 0;
    const count = this.queue.length;
    const callback = this.readinessCallback;
    for (let i = 0; i < count; i++) {
      const { module } = this.queue[i];
      timeout += this.queue[i].timeout;
      this.queue[i].queuedId = setTimeout(() => {
        if (module instanceof ExecModule) {
          module.exec(this.scope)
            .then((params = {}) => callback(params));
        }
        if (module instanceof EventModule) {
          module.start(this.scope, callback);
        }
      }, timeout);
    }
  }

  stop() {
    const count = this.queue.length;
    for (let i = 0; i < count; i++) {
      if (this.queue[i].queuedId) {
        if (this.queue[i].module instanceof EventModule) {
          this.queue[i].module.stop();
        }
        clearTimeout(this.queue[i].queuedId);
      }
    }
  }
}

class CopyPasteEventModule extends EventModule {
  _cb = null

  async start(scope, readinessCallback) {
    // this method need to be implemented
    // when event has happened readinessCallback need to be called with detected events
    // return super.start(scope, readinessCallback);
    if (readinessCallback && typeof readinessCallback === 'function') {
      this._cb = readinessCallback
      scope.doc.body.addEventListener('copy', this._cb);
      scope.doc.body.addEventListener('paste', this._cb);
    }
    console.log('CopyPasteEventModule started...');
  }

  async stop() {
    // this method need to be implemented
    // return super.stop();
    if (this._cb) {
      scope.doc.body.addEventListener('copy', this._cb);
      scope.doc.body.addEventListener('paste', this._cb);
    }
    console.log('CopyPasteEventModule stoped...');
  }
}

class FontsDetectionModule extends ExecModule {
  // async exec(scope) {
    // this method need to be implemented
    // return super.exec(scope);
    
  // }
  static #fontsList = [
    'American Typewriter',
    'Andale Mono',
    'Arial',
    'Arial Black',
    'Arial Narrow',
    'Arial Rounded MT Bold',
    'Arial Unicode MS',
    'Avenir',
    'Avenir Next',
    'Avenir Next Condensed',
    'Bahnschrift',
    'Baskerville',
    'Big Caslon',
    'Bodoni 72',
    'Bodoni 72 Oldstyle',
    'Bodoni 72 Smallcaps',
    'Bradley Hand',
    'Brush Script MT',
    'Calibri',
    'Cambria',
    'Cambria Math',
    'Candara',
    'Chalkboard',
    'Chalkboard SE',
    'Chalkduster',
    'Charter',
    'Cochin',
    'Comic Sans MS',
    'Consolas',
    'Constantia',
    'Copperplate',
    'Corbel',
    'Courier',
    'Courier New',
    'Didot',
    'DIN Alternate',
    'DIN Condensed',
    'Ebrima',
    'Franklin Gothic Medium',
    'Futura',
    'Gabriola',
    'Gadugi',
    'Geneva',
    'Georgia',
    'Gill Sans',
    'Helvetica',
    'Helvetica Neue',
    'Herculanum',
    'Hoefler Text',
    'HoloLens MDL2 Assets',
    'Impact',
    'Ink Free',
    'Javanese Text',
    'Leelawadee UI',
    'Lucida Console',
    'Lucida Grande',
    'Lucida Sans Unicode',
    'Luminari',
    'Malgun Gothic',
    'Marker Felt',
    'Marlett',
    'Menlo',
    'Microsoft Himalaya',
    'Microsoft JhengHei',
    'Microsoft New Tai Lue',
    'Microsoft PhagsPa',
    'Microsoft Sans Serif',
    'Microsoft Tai Le',
    'Microsoft YaHei',
    'Microsoft Yi Baiti',
    'MingLiU-ExtB',
    'Monaco',
    'Mongolian Baiti',
    'MS Gothic',
    'MV Boli',
    'Myanmar Text',
    'Nirmala UI',
    'Noteworthy',
    'Optima',
    'Palatino',
    'Palatino Linotype',
    'Papyrus',
    'Phosphate',
    'Rockwell',
    'Savoye LET',
    'Segoe MDL2 Assets',
    'Segoe Print',
    'Segoe Script',
    'Segoe UI',
    'Segoe UI Historic',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'SignPainter',
    'SimSun',
    'Sitka',
    'Skia',
    'Snell Roundhand',
    'Sylfaen',
    'Symbol',
    'Tahoma',
    'Times',
    'Times New Roman',
    'Trattatello',
    'Trebuchet MS',
    'Verdana',
    'Webdings',
    'Wingdings',
    'Yu Gothic',
    'Zapfino'
  ]

  static #baseFonts = ['monospace', 'sans-serif', 'serif']
  static #testString = "mmmmmmmmmmlli"
  static #testSize = '72px'

  async exec (scope) {

    const defaultWidth = []
    const result = []

    // Create Canvas and get Context
    const canvas = scope.doc.createElement('canvas');
    const ctx = canvas.getContext("2d")

    // Get the widths of the base fonts
    let textMetrics
    for (let i = 0; i < FontsDetectionModule.#baseFonts.length; i++) {
      ctx.font = `${FontsDetectionModule.#testSize} ${FontsDetectionModule.#baseFonts[i]}`
      textMetrics = ctx.measureText(FontsDetectionModule.#testString)
      defaultWidth[i] = textMetrics.width
    }

    // Compare the font width with the base font width
    let curFontWidth, matched
    for (let i = 0; i < FontsDetectionModule.#fontsList.length; i++) {
      ctx.font = `${FontsDetectionModule.#testSize} ${FontsDetectionModule.#fontsList[i]}`
      textMetrics = ctx.measureText(FontsDetectionModule.#testString)
        
      curFontWidth = textMetrics.width
      matched = false
      for (let j = 0; j < defaultWidth.length; j++) {
        if (curFontWidth == defaultWidth[j]) {
          matched = true
          break
        }
      }
        
      if (!matched)
        result.push(FontsDetectionModule.#fontsList[i])
        
    }

    let div
    for (let i = 0; i < result.length; i++) {
        div = scope.doc.createElement('div')
        div.innerText = result[i]
        scope.doc.body.appendChild(div)
    }
  }
}

(async (win, doc, nav) => {
  /**
   * @param {Object} params
   */
  const callback = function (params = {}) {
    // console.log("Params were fetched from module", params);
    if (params.type === 'copy') {
      console.log(`Copy to Clipboard ${doc.getSelection()}`);
    }
    if (params.type === 'paste') {
      console.log(`Paste from Clipboard ${params.clipboardData.getData('text/plain')}`);
    }
  };

  const qe = new Queue("events", { win, doc, nav }, callback);
  qe.add(new CopyPasteEventModule(), 2000);
  qe.start();

  const qd = new Queue("data", { win, doc, nav }, callback);
  qd.add(new FontsDetectionModule(), 1000);
  qd.start();

})(window, document, navigator);