class __ {
  canvas;
  cx;
  image;
  strokePoints;
  timeoutResize;
  widthParent;
  eventPrevPoint;
  isTouchDevice = false;
}

export default class CanvasDraw {
  /**
  * Create a CanvasDraw.
  * @param {Object} options - Optional settings object.
  */
  constructor(options) {

    // Merge defaults with user's settings
    this._config = CanvasDraw.assingOptions(options);

    __.canvas = document.createElement("canvas");
    __.cx = __.canvas.getContext('2d');

    if (!this._config.background) {
      throw 'You need specify your base64 background image 😢';
    }

    if (this._config.lineWidth <= 0) {
      throw 'Your line width should be higher than 0 😂';
    }

    if (this._config.parentElement) {
      this._config.parentElement = document.querySelector(this._config.parentElement);
      if (!this._config.parentElement) {
        throw 'Parent Element not found 🤬!';
      }
      this._config.parentElement.appendChild(__.canvas);
    } else {
      document.body.appendChild(__.canvas);
    }

    __.isTouchDevice = this.isTouchDevice();

    __.image = new Image();
    __.image.src = this._config.background;
    __.image.onload = () => {
      __.strokePoints = [];
      this.init();
    };
  }

  /**
   * Merge default setting with user options
   * @param {Object} options
   */
  static assingOptions(options) {
    const settings = {
      background: undefined,
      parentElement: undefined,
      lineWidth: 8,
      lineColor: '#000',
      onInit: () => { },
      onUndo: () => { },
      onClear: () => { },
      onSave: () => { },
    };
    return Object.assign(settings, options);
  }

  init() {
    this.attachEvents();

    const widthParent = this._config.parentElement ? this._config.parentElement.clientWidth : window.innerWidth;

    const width = this.fitScreen(widthParent) ? (widthParent - 16) : __.image.width;
    const height = width * __.image.height / __.image.width;

    __.canvas.width = width;
    __.canvas.height = height;
    __.cx.drawImage(__.image, 0, 0, width, height);
    __.cx.lineWidth = this._config.lineWidth;
    __.cx.strokeStyle = this._config.lineColor;
    __.cx.lineCap = 'round';

    this._config.onInit.call(this);
  }

  fitScreen(widthParent) {
    return (__.image.width > (widthParent - 16));
  }

  attachEvents() {
    if (__.isTouchDevice) {
      __.canvas.addEventListener('touchstart', this.drawStartEvent);
    } else {
      __.canvas.addEventListener('mousedown', this.drawStartEvent);
    }
    window.addEventListener('resize', this.resizeEvent);
  }

  detachEvents() {
    if (__.isTouchDevice) {
      __.canvas.addEventListener('touchstart', this.drawStartEvent);
    } else {
      __.canvas.addEventListener('mousedown', this.drawStartEvent);
    }
    window.removeEventListener('resize', this.resizeEvent);
  }

  resizeEvent = () => {
    clearTimeout(__.timeoutResize);
    __.timeoutResize = setTimeout(() => this.resizeHandler(), 500);
  }

  resizeHandler() {
    this.detachEvents();
    __.isTouchDevice = this.isTouchDevice();
    this.attachEvents();
    __.strokePoints = [];
    this.init();
  }

  drawStartEvent = (ev) => {
    ev.preventDefault();
    __.strokePoints.push({ prevPos: undefined, currentPos: undefined, mode: ev.type });

    if (__.isTouchDevice) {
      __.canvas.addEventListener('touchmove', this.drawEvent);
      __.canvas.addEventListener('touchend', this.drawStopEvent);
      __.canvas.addEventListener('touchcancel', this.drawStopEvent);
    } else {
      __.canvas.addEventListener('mousemove', this.drawEvent);
      __.canvas.addEventListener('mouseup', this.drawStopEvent);
      __.canvas.addEventListener('mouseleave', this.drawStopEvent);
    }
  }

  drawEvent = (ev) => {
    const rect = __.canvas.getBoundingClientRect();

    if (__.isTouchDevice) {
      const point = {
        x: ev.touches[0].clientX - rect.left,
        y: ev.touches[0].clientY - rect.top
      }
    } else {
      const point = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
      }
    }

    if (__.eventPrevPoint) {
      __.strokePoints.push({ prevPos: __.eventPrevPoint, currentPos: point, mode: ev.type });
      this.drawOnCanvas(__.eventPrevPoint, point);
    }
    __.eventPrevPoint = point;
  }

  drawStopEvent = () => {
    if (__.eventPrevPoint) {
      __.eventPrevPoint = undefined;
    }
    if (__.isTouchDevice) {
      __.canvas.removeEventListener('touchmove', this.drawEvent);
      __.canvas.removeEventListener('touchend', this.drawStopEvent);
      __.canvas.removeEventListener('touchcancel', this.drawStopEvent);
    } else {
      __.canvas.removeEventListener('mousemove', this.drawEvent);
      __.canvas.removeEventListener('mouseup', this.drawStopEvent);
      __.canvas.removeEventListener('mouseleave', this.drawStopEvent);
    }
  }

  drawOnCanvas(prevPos, currentPos) {
    __.cx.beginPath();

    if (prevPos) {
      __.cx.moveTo(prevPos.x, prevPos.y); // from
      __.cx.lineTo(currentPos.x, currentPos.y);
      __.cx.stroke();
    }
  }

  isTouchDevice() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function (query) {
      return window.matchMedia(query).matches;
    }

    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
      return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
  }

  destroy() {
    console.log('destroy');
    this.detachEvents();
  }


  /************************************************************
   *+++++++++++++++++++++ PUBLIC FUNCTIONS ++++++++++++++++++++
   ***********************************************************/

  undo = () => {
    if (__.strokePoints.length === 0) { return; }

    let mouseDown = false;
    const eventTypes = ['down', 'start'];

    for (let i = __.strokePoints.length - 1; i >= 0; i--) {
      if (eventTypes.some(el => __.strokePoints[i].mode.includes(el))) {
        __.strokePoints.pop();
        mouseDown = true;
      }
      if (i === 0 || (mouseDown && __.strokePoints[i - 1].mode.includes('move'))) {
        __.strokePoints = __.strokePoints.slice(0, i);
        this.init();
        __.strokePoints.forEach(point => {
          this.drawOnCanvas(point.prevPos, point.currentPos);
        })
        return;
      }
    }

    this._config.onUndo.call(this);
  }

  clear = () => {
    __.strokePoints = [];
    this._config.onClear.call(this);
    this.init();
  }

  save = (type) => {
    var imageMimes = ['png', 'bmp', 'gif', 'jpg', 'jpeg', 'tiff'];
    if (type) {
      if (imageMimes.some(el => type.includes(el))) {
        const image = new Image();
        image.src = __.canvas.toDataURL('image/' + type);
        this._config.onSave.call(this);
        return image;
      } else {
        throw ('No MIME type allowed 😭! Please use ' + imageMimes);
      }
    }

    this._config.onSave.call(this);
    return __.canvas.toDataURL();
  }

  destroy = () => {
    try {
      __.canvas.parentNode.removeChild(__.canvas);
    } catch (e) {
      console.error('Destroy action: Element no found!');
    }
  }
}
