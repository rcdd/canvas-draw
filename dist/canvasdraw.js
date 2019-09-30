'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var CanvasDraw = function (options) {
  var config;
  var canvas;
  var cx;
  var image;
  var strokePoints;
  var timeoutResize;
  var eventPrevPoint;
  var isTouch;

  function CanvasDraw(options) {
    var _this2 = this;

    /**
     * Merge default setting with user options
     * @param {Object} options
     */
    this.assignOptions = function (options) {
      var settings = {
        background: undefined,
        parentElement: undefined,
        lineWidth: 8,
        lineColor: '#000'
      };
      return Object.assign(settings, options);
    };

    this.init = function () {
      this.attachEvents();
      var widthParent = config.parentElement ? config.parentElement.clientWidth : window.innerWidth;
      var width = this.fitScreen(widthParent) ? widthParent - 16 : image.width;
      var height = width * image.height / image.width;
      canvas.width = width;
      canvas.height = height;
      cx.drawImage(image, 0, 0, width, height);
      cx.lineCap = 'round';
    };

    this.fitScreen = function (widthParent) {
      return image.width > widthParent - 16;
    };

    this.attachEvents = function () {
      if (isTouch) {
        canvas.addEventListener('touchstart', this.drawStartEvent);
      } else {
        canvas.addEventListener('mousedown', this.drawStartEvent);
      }

      window.addEventListener('resize', this.resizeEvent);
    };

    this.detachEvents = function () {
      if (isTouch) {
        canvas.addEventListener('touchstart', this.drawStartEvent);
      } else {
        canvas.addEventListener('mousedown', this.drawStartEvent);
      }

      window.removeEventListener('resize', this.resizeEvent);
    };

    this.resizeEvent = function () {
      clearTimeout(timeoutResize);
      timeoutResize = setTimeout(function () {
        return _this2.resizeHandler();
      }, 500);
    };

    this.resizeHandler = function () {
      this.detachEvents();
      isTouch = this.isTouchDevice();
      this.attachEvents();
      strokePoints = [];
      this.init();
    };

    this.drawStartEvent = function (ev) {
      ev.preventDefault();
      strokePoints.push({
        prevPos: undefined,
        currentPos: undefined,
        mode: ev.type
      });

      if (isTouch) {
        canvas.addEventListener('touchmove', _this2.drawEvent);
        canvas.addEventListener('touchend', _this2.drawStopEvent);
        canvas.addEventListener('touchcancel', _this2.drawStopEvent);
      } else {
        canvas.addEventListener('mousemove', _this2.drawEvent);
        canvas.addEventListener('mouseup', _this2.drawStopEvent);
        canvas.addEventListener('mouseleave', _this2.drawStopEvent);
      }
    };

    this.drawEvent = function (ev) {
      var rect = canvas.getBoundingClientRect();
      var point;

      if (isTouch) {
        point = {
          x: ev.touches[0].clientX - rect.left,
          y: ev.touches[0].clientY - rect.top
        };
      } else {
        point = {
          x: ev.clientX - rect.left,
          y: ev.clientY - rect.top
        };
      }

      if (eventPrevPoint) {
        var drawOptions = {
          lineWidth: config.lineWidth,
          lineColor: config.lineColor
        };
        strokePoints.push({
          prevPos: eventPrevPoint,
          currentPos: point,
          mode: ev.type,
          options: drawOptions
        });

        _this2.drawOnCanvas(eventPrevPoint, point, drawOptions);
      }

      eventPrevPoint = point;
    };

    this.drawStopEvent = function () {
      if (eventPrevPoint) {
        eventPrevPoint = undefined;
      }

      if (isTouch) {
        canvas.removeEventListener('touchmove', _this2.drawEvent);
        canvas.removeEventListener('touchend', _this2.drawStopEvent);
        canvas.removeEventListener('touchcancel', _this2.drawStopEvent);
      } else {
        canvas.removeEventListener('mousemove', _this2.drawEvent);
        canvas.removeEventListener('mouseup', _this2.drawStopEvent);
        canvas.removeEventListener('mouseleave', _this2.drawStopEvent);
      }
    };

    this.drawOnCanvas = function (prevPos, currentPos, drawOptions) {
      cx.beginPath();

      if (prevPos) {
        cx.lineWidth = drawOptions.lineWidth;
        cx.strokeStyle = drawOptions.lineColor;
        cx.moveTo(prevPos.x, prevPos.y); // from

        cx.lineTo(currentPos.x, currentPos.y);
        cx.stroke();
      }
    };

    this.isTouchDevice = function () {
      var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

      var mq = function mq(query) {
        return window.matchMedia(query).matches;
      };

      if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
      } // include the 'heartz' as a way to have a non matching MQ to help terminate the join
      // https://git.io/vznFH


      var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
      return mq(query);
    };

    this.destroy = function () {
      console.log('destroy');
      this.detachEvents();
    };
    /************************************************************
     *+++++++++++++++++++++ PUBLIC FUNCTIONS ++++++++++++++++++++
     ***********************************************************/


    this.undo = function () {
      var _this3 = this;

      if (strokePoints.length === 0) {
        return;
      }

      var mouseDown = false;
      var eventTypes = ['down', 'start'];

      var _loop = function _loop(i) {
        if (eventTypes.some(function (el) {
          return strokePoints[i].mode.includes(el);
        })) {
          strokePoints.pop();
          mouseDown = true;
        }

        if (i === 0 || mouseDown && strokePoints[i - 1].mode.includes('move')) {
          strokePoints = strokePoints.slice(0, i);

          _this3.init();

          strokePoints.forEach(function (point) {
            _this3.drawOnCanvas(point.prevPos, point.currentPos, point.options);
          });
          return {
            v: void 0
          };
        }
      };

      for (var i = strokePoints.length - 1; i >= 0; i--) {
        var _ret = _loop(i);

        if (_typeof(_ret) === "object") return _ret.v;
      }
    };

    this.clear = function () {
      strokePoints = [];
      this.init();
    };

    this.update = function (obj) {
      for (var i = 0; i < Object.keys(obj).length; i++) {
        config[Object.keys(obj)[i]] = obj[Object.keys(obj)[i]];
      }
    };

    this.save = function (type) {
      var imageMimes = ['png', 'bmp', 'gif', 'jpg', 'jpeg', 'tiff'];

      if (type) {
        if (imageMimes.some(function (el) {
          return type.includes(el);
        })) {
          var _image = new Image();

          _image.src = canvas.toDataURL('image/' + type);
          console.log(_image);
          window.imageTest = _image;
          return _image;
        } else {
          throw 'No MIME type allowed 😭! Please use ' + imageMimes;
        }
      }

      return canvas.toDataURL();
    };

    this.remove = function () {
      try {
        canvas.parentNode.removeChild(canvas);
      } catch (e) {
        console.error('Destroy action: Element no found!');
      }
    };

    var _this = this;

    function __init__() {
      // Merge defaults with user's settings
      config = _this.assignOptions(options);
      canvas = document.createElement("canvas");
      cx = canvas.getContext('2d');

      if (!config.background) {
        throw 'You need specify your base64 background image 😢';
      }

      if (config.lineWidth <= 0) {
        throw 'Your line width should be higher than 0 😂';
      }

      if (config.parentElement) {
        config.parentElement = document.querySelector(config.parentElement);

        if (!config.parentElement) {
          throw 'Parent Element not found 🤬!';
        }

        config.parentElement.appendChild(canvas);
      } else {
        document.body.appendChild(canvas);
      }

      isTouch = _this.isTouchDevice();
      image = new Image();
      image.src = config.background;

      image.onload = function () {
        strokePoints = [];

        _this.init();
      };
    }

    __init__();
  }

  return CanvasDraw;
}();

var _default = CanvasDraw;
exports["default"] = _default;