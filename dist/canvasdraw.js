'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var CanvasDraw = exports.CanvasDraw = function () {









    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Create a CanvasDraw.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @param {Object} options - Optional settings object.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */
    function CanvasDraw(options) {var _this = this;_classCallCheck(this, CanvasDraw);this.




















































































        resizeEvent = function () {
            clearTimeout(_this.timeoutResize);
            _this.timeoutResize = setTimeout(function () {return _this.resizeHandler();}, 500);
        };this.









        drawStartEvent = function (ev) {
            ev.preventDefault();
            _this.strokePoints.push({ prevPos: undefined, currentPos: undefined, mode: ev.type });

            if (_this.isTouch) {
                _this.canvas.addEventListener('touchmove', _this.drawEvent);
                _this.canvas.addEventListener('touchend', _this.drawStopEvent);
                _this.canvas.addEventListener('touchcancel', _this.drawStopEvent);
            } else {
                _this.canvas.addEventListener('mousemove', _this.drawEvent);
                _this.canvas.addEventListener('mouseup', _this.drawStopEvent);
                _this.canvas.addEventListener('mouseleave', _this.drawStopEvent);
            }
        };this.

        drawEvent = function (ev) {
            var rect = _this.canvas.getBoundingClientRect();
            var point = void 0;
            if (_this.isTouch) {
                point = {
                    x: ev.touches[0].clientX - rect.left,
                    y: ev.touches[0].clientY - rect.top };

            } else {
                point = {
                    x: ev.clientX - rect.left,
                    y: ev.clientY - rect.top };

            }

            if (_this.eventPrevPoint) {
                var drawOptions = { lineWidth: _this.config.lineWidth, lineColor: _this.config.lineColor };
                _this.strokePoints.push({
                    prevPos: _this.eventPrevPoint,
                    currentPos: point,
                    mode: ev.type,
                    options: drawOptions });

                _this.drawOnCanvas(_this.eventPrevPoint, point, drawOptions);
            }
            _this.eventPrevPoint = point;
        };this.

        drawStopEvent = function () {
            if (_this.eventPrevPoint) {
                _this.eventPrevPoint = undefined;
            }
            if (_this.isTouch) {
                _this.canvas.removeEventListener('touchmove', _this.drawEvent);
                _this.canvas.removeEventListener('touchend', _this.drawStopEvent);
                _this.canvas.removeEventListener('touchcancel', _this.drawStopEvent);
            } else {
                _this.canvas.removeEventListener('mousemove', _this.drawEvent);
                _this.canvas.removeEventListener('mouseup', _this.drawStopEvent);
                _this.canvas.removeEventListener('mouseleave', _this.drawStopEvent);
            }
        };this.







































        undo = function () {
            if (_this.strokePoints.length === 0) {
                return;
            }

            var mouseDown = false;
            var eventTypes = ['down', 'start'];var _loop = function _loop(

            i) {
                if (eventTypes.some(function (el) {return _this.strokePoints[i].mode.includes(el);})) {
                    _this.strokePoints.pop();
                    mouseDown = true;
                }
                if (i === 0 || mouseDown && _this.strokePoints[i - 1].mode.includes('move')) {
                    _this.strokePoints = _this.strokePoints.slice(0, i);
                    _this.init();
                    _this.strokePoints.forEach(function (point) {
                        _this.drawOnCanvas(point.prevPos, point.currentPos, point.options);
                    });
                    return { v: void 0 };
                }};for (var i = _this.strokePoints.length - 1; i >= 0; i--) {var _ret = _loop(i);if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }
        };this.

        clear = function () {
            _this.strokePoints = [];
            _this.init();
        };this.

        update = function (obj) {
            for (var i = 0; i < Object.keys(obj).length; i++) {
                _this.config[Object.keys(obj)[i]] = obj[Object.keys(obj)[i]];
            }
        };this.

        save = function (type) {
            var imageMimes = ['png', 'bmp', 'gif', 'jpg', 'jpeg', 'tiff'];
            if (type) {
                if (imageMimes.some(function (el) {return type.includes(el);})) {
                    var image = new Image();
                    image.src = _this.canvas.toDataURL('image/' + type);
                    _this.config.onSave.call(_this);
                    return image;
                } else {
                    throw 'No MIME type allowed 😭! Please use ' + imageMimes;
                }
            }
            return _this.canvas.toDataURL();
        };this.

        destroy = function () {
            try {
                _this.canvas.parentNode.removeChild(_this.canvas);
            } catch (e) {
                console.error('Destroy action: Element no found!');
            }
        }; // Merge defaults with user's settings
        this.config = CanvasDraw.assignOptions(options);this.canvas = document.createElement("canvas");this.cx = this.canvas.getContext('2d');if (!this.config.background) {throw 'You need specify your base64 background image 😢';}if (this.config.lineWidth <= 0) {throw 'Your line width should be higher than 0 😂';}if (this.config.parentElement) {this.config.parentElement = document.querySelector(this.config.parentElement);if (!this.config.parentElement) {throw 'Parent Element not found 🤬!';}this.config.parentElement.appendChild(this.canvas);} else {document.body.appendChild(this.canvas);}this.isTouch = this.isTouchDevice();this.image = new Image();this.image.src = this.config.background;this.image.onload = function () {_this.strokePoints = [];_this.init();};} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Merge default setting with user options
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @param {Object} options
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */_createClass(CanvasDraw, [{ key: 'init', value: function init() {this.attachEvents();var widthParent = this.config.parentElement ? this.config.parentElement.clientWidth : window.innerWidth;var width = this.fitScreen(widthParent) ? widthParent - 16 : this.image.width;var height = width * this.image.height / this.image.width;this.canvas.width = width;this.canvas.height = height;this.cx.drawImage(this.image, 0, 0, width, height);this.cx.lineCap = 'round';} }, { key: 'fitScreen', value: function fitScreen(widthParent) {return this.image.width > widthParent - 16;} }, { key: 'attachEvents', value: function attachEvents() {if (this.isTouch) {this.canvas.addEventListener('touchstart', this.drawStartEvent);} else {this.canvas.addEventListener('mousedown', this.drawStartEvent);}window.addEventListener('resize', this.resizeEvent);} }, { key: 'detachEvents', value: function detachEvents() {if (this.isTouch) {this.canvas.addEventListener('touchstart', this.drawStartEvent);} else {this.canvas.addEventListener('mousedown', this.drawStartEvent);}window.removeEventListener('resize', this.resizeEvent);} }, { key: 'resizeHandler', value: function resizeHandler() {this.detachEvents();this.isTouch = this.isTouchDevice();this.attachEvents();this.strokePoints = [];this.init();} }, { key: 'drawOnCanvas', value: function drawOnCanvas(prevPos, currentPos, drawOptions) {this.cx.beginPath();if (prevPos) {this.cx.lineWidth = drawOptions.lineWidth;this.cx.strokeStyle = drawOptions.lineColor;this.cx.moveTo(prevPos.x, prevPos.y); // from
                this.cx.lineTo(currentPos.x, currentPos.y);this.cx.stroke();}} }, { key: 'isTouchDevice', value: function isTouchDevice() {var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');var mq = function mq(query) {return window.matchMedia(query).matches;};if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {return true;} // include the 'heartz' as a way to have a non matching MQ to help terminate the join
            // https://git.io/vznFH
            var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');return mq(query);} }, { key: 'destroy', value: function destroy() {console.log('destroy');this.detachEvents();} /************************************************************
                                                                                                                                                                                                          *+++++++++++++++++++++ PUBLIC FUNCTIONS ++++++++++++++++++++
                                                                                                                                                                                                          ***********************************************************/ }], [{ key: 'assignOptions', value: function assignOptions(options) {var settings = { background: undefined, parentElement: undefined, lineWidth: 8, lineColor: '#000' };return Object.assign(settings, options);} }]);return CanvasDraw;}();