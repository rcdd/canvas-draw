'use strict';

const CanvasDraw = (function (options) {
    let config;
    let canvas;
    let cx;
    let image;
    let strokePoints;
    let timeoutResize;
    let eventPrevPoint;
    let isTouch;

    function CanvasDraw(options) {
        /**
         * Merge default setting with user options
         * @param {Object} options
         */
        this.assignOptions = function (options) {
            const settings = {
                background: undefined,
                parentElement: undefined,
                lineWidth: 8,
                lineColor: '#000'
            };
            return Object.assign(settings, options);
        };

        this.init = function () {
            this.attachEvents();

            const widthParent = config.parentElement ? config.parentElement.clientWidth : window.innerWidth;

            const width = this.fitScreen(widthParent) ? (widthParent - 16) : image.width;
            const height = width * image.height / image.width;

            canvas.width = width;
            canvas.height = height;
            cx.drawImage(image, 0, 0, width, height);
            cx.lineCap = 'round';
        };

        this.fitScreen = function (widthParent) {
            return (image.width > (widthParent - 16));
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

        this.resizeEvent = () => {
            clearTimeout(timeoutResize);
            timeoutResize = setTimeout(() => this.resizeHandler(), 500);
        };

        this.resizeHandler = function () {
            this.detachEvents();
            isTouch = this.isTouchDevice();
            this.attachEvents();
            strokePoints = [];
            this.init();
        };

        this.drawStartEvent = (ev) => {
            ev.preventDefault();
            strokePoints.push({ prevPos: undefined, currentPos: undefined, mode: ev.type });

            if (isTouch) {
                canvas.addEventListener('touchmove', this.drawEvent);
                canvas.addEventListener('touchend', this.drawStopEvent);
                canvas.addEventListener('touchcancel', this.drawStopEvent);
            } else {
                canvas.addEventListener('mousemove', this.drawEvent);
                canvas.addEventListener('mouseup', this.drawStopEvent);
                canvas.addEventListener('mouseleave', this.drawStopEvent);
            }
        };

        this.drawEvent = (ev) => {
            const rect = canvas.getBoundingClientRect();
            let point;
            if (isTouch) {
                point = {
                    x: ev.touches[0].clientX - rect.left,
                    y: ev.touches[0].clientY - rect.top
                }
            } else {
                point = {
                    x: ev.clientX - rect.left,
                    y: ev.clientY - rect.top
                }
            }

            if (eventPrevPoint) {
                const drawOptions = { lineWidth: config.lineWidth, lineColor: config.lineColor };
                strokePoints.push({
                    prevPos: eventPrevPoint,
                    currentPos: point,
                    mode: ev.type,
                    options: drawOptions
                });
                this.drawOnCanvas(eventPrevPoint, point, drawOptions);
            }
            eventPrevPoint = point;
        };

        this.drawStopEvent = () => {
            if (eventPrevPoint) {
                eventPrevPoint = undefined;
            }
            if (isTouch) {
                canvas.removeEventListener('touchmove', this.drawEvent);
                canvas.removeEventListener('touchend', this.drawStopEvent);
                canvas.removeEventListener('touchcancel', this.drawStopEvent);
            } else {
                canvas.removeEventListener('mousemove', this.drawEvent);
                canvas.removeEventListener('mouseup', this.drawStopEvent);
                canvas.removeEventListener('mouseleave', this.drawStopEvent);
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
            let prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
            const mq = function (query) {
                return window.matchMedia(query).matches;
            };

            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
                return true;
            }

            // include the 'heartz' as a way to have a non matching MQ to help terminate the join
            // https://git.io/vznFH
            const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
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
            if (strokePoints.length === 0) {
                return;
            }

            let mouseDown = false;
            const eventTypes = ['down', 'start'];

            for (let i = strokePoints.length - 1; i >= 0; i--) {
                if (eventTypes.some(el => strokePoints[i].mode.includes(el))) {
                    strokePoints.pop();
                    mouseDown = true;
                }
                if (i === 0 || (mouseDown && strokePoints[i - 1].mode.includes('move'))) {
                    strokePoints = strokePoints.slice(0, i);
                    this.init();
                    strokePoints.forEach(point => {
                        this.drawOnCanvas(point.prevPos, point.currentPos, point.options);
                    });
                    return;
                }
            }
        };

        this.clear = function () {
            strokePoints = [];
            this.init();
        };

        this.update = function (obj) {
            for (let i = 0; i < Object.keys(obj).length; i++) {
                config[Object.keys(obj)[i]] = obj[Object.keys(obj)[i]];
            }
        };

        this.save = function (type) {
            const imageMimes = ['png', 'bmp', 'gif', 'jpg', 'jpeg', 'tiff'];
            if (type) {
                if (imageMimes.some(el => type.includes(el))) {
                    const image = new Image();
                    image.src = canvas.toDataURL('image/' + type);
                    console.log(image);
                    window.imageTest = image;
                    return image;
                } else {
                    throw ('No MIME type allowed 😭! Please use ' + imageMimes);
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

        const _this = this;

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
            image.onload = () => {
                strokePoints = [];
                _this.init();
            }
        }

        __init__();
    }

    return CanvasDraw;
}());

export default CanvasDraw;
