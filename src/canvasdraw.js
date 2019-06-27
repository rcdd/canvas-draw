export class CanvasDraw {
    config;
    canvas;
    cx;
    image;
    strokePoints;
    timeoutResize;
    eventPrevPoint;
    isTouch;

    /**
     * Create a CanvasDraw.
     * @param {Object} options - Optional settings object.
     */
    constructor(options) {
        // Merge defaults with user's settings
        this.config = CanvasDraw.assignOptions(options);

        this.canvas = document.createElement("canvas");
        this.cx = this.canvas.getContext('2d');

        if (!this.config.background) {
            throw 'You need specify your base64 background image 😢';
        }

        if (this.config.lineWidth <= 0) {
            throw 'Your line width should be higher than 0 😂';
        }

        if (this.config.parentElement) {
            this.config.parentElement = document.querySelector(this.config.parentElement);
            if (!this.config.parentElement) {
                throw 'Parent Element not found 🤬!';
            }
            this.config.parentElement.appendChild(this.canvas);
        } else {
            document.body.appendChild(this.canvas);
        }

        this.isTouch = this.isTouchDevice();

        this.image = new Image();
        this.image.src = this.config.background;
        this.image.onload = () => {
            this.strokePoints = [];
            this.init();
        };
    }

    /**
     * Merge default setting with user options
     * @param {Object} options
     */
    static assignOptions(options) {
        const settings = {
            background: undefined,
            parentElement: undefined,
            lineWidth: 8,
            lineColor: '#000'
        };
        return Object.assign(settings, options);
    }

    init() {
        this.attachEvents();

        const widthParent = this.config.parentElement ? this.config.parentElement.clientWidth : window.innerWidth;

        const width = this.fitScreen(widthParent) ? (widthParent - 16) : this.image.width;
        const height = width * this.image.height / this.image.width;

        this.canvas.width = width;
        this.canvas.height = height;
        this.cx.drawImage(this.image, 0, 0, width, height);
        this.cx.lineCap = 'round';
    }

    fitScreen(widthParent) {
        return (this.image.width > (widthParent - 16));
    }

    attachEvents() {
        if (this.isTouch) {
            this.canvas.addEventListener('touchstart', this.drawStartEvent);
        } else {
            this.canvas.addEventListener('mousedown', this.drawStartEvent);
        }
        window.addEventListener('resize', this.resizeEvent);
    }

    detachEvents() {
        if (this.isTouch) {
            this.canvas.addEventListener('touchstart', this.drawStartEvent);
        } else {
            this.canvas.addEventListener('mousedown', this.drawStartEvent);
        }
        window.removeEventListener('resize', this.resizeEvent);
    }

    resizeEvent = () => {
        clearTimeout(this.timeoutResize);
        this.timeoutResize = setTimeout(() => this.resizeHandler(), 500);
    }

    resizeHandler() {
        this.detachEvents();
        this.isTouch = this.isTouchDevice();
        this.attachEvents();
        this.strokePoints = [];
        this.init();
    }

    drawStartEvent = (ev) => {
        ev.preventDefault();
        this.strokePoints.push({prevPos: undefined, currentPos: undefined, mode: ev.type});

        if (this.isTouch) {
            this.canvas.addEventListener('touchmove', this.drawEvent);
            this.canvas.addEventListener('touchend', this.drawStopEvent);
            this.canvas.addEventListener('touchcancel', this.drawStopEvent);
        } else {
            this.canvas.addEventListener('mousemove', this.drawEvent);
            this.canvas.addEventListener('mouseup', this.drawStopEvent);
            this.canvas.addEventListener('mouseleave', this.drawStopEvent);
        }
    }

    drawEvent = (ev) => {
        const rect = this.canvas.getBoundingClientRect();
        let point;
        if (this.isTouch) {
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

        if (this.eventPrevPoint) {
            const drawOptions = {lineWidth: this.config.lineWidth, lineColor: this.config.lineColor};
            this.strokePoints.push({
                prevPos: this.eventPrevPoint,
                currentPos: point,
                mode: ev.type,
                options: drawOptions
            });
            this.drawOnCanvas(this.eventPrevPoint, point, drawOptions);
        }
        this.eventPrevPoint = point;
    }

    drawStopEvent = () => {
        if (this.eventPrevPoint) {
            this.eventPrevPoint = undefined;
        }
        if (this.isTouch) {
            this.canvas.removeEventListener('touchmove', this.drawEvent);
            this.canvas.removeEventListener('touchend', this.drawStopEvent);
            this.canvas.removeEventListener('touchcancel', this.drawStopEvent);
        } else {
            this.canvas.removeEventListener('mousemove', this.drawEvent);
            this.canvas.removeEventListener('mouseup', this.drawStopEvent);
            this.canvas.removeEventListener('mouseleave', this.drawStopEvent);
        }
    }

    drawOnCanvas(prevPos, currentPos, drawOptions) {
        this.cx.beginPath();

        if (prevPos) {
            this.cx.lineWidth = drawOptions.lineWidth;
            this.cx.strokeStyle = drawOptions.lineColor;
            this.cx.moveTo(prevPos.x, prevPos.y); // from
            this.cx.lineTo(currentPos.x, currentPos.y);
            this.cx.stroke();
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
        if (this.strokePoints.length === 0) {
            return;
        }

        let mouseDown = false;
        const eventTypes = ['down', 'start'];

        for (let i = this.strokePoints.length - 1; i >= 0; i--) {
            if (eventTypes.some(el => this.strokePoints[i].mode.includes(el))) {
                this.strokePoints.pop();
                mouseDown = true;
            }
            if (i === 0 || (mouseDown && this.strokePoints[i - 1].mode.includes('move'))) {
                this.strokePoints = this.strokePoints.slice(0, i);
                this.init();
                this.strokePoints.forEach(point => {
                    this.drawOnCanvas(point.prevPos, point.currentPos, point.options);
                })
                return;
            }
        }
    }

    clear = () => {
        this.strokePoints = [];
        this.init();
    }

    update = (obj) => {
        for (let i = 0; i < Object.keys(obj).length; i++) {
            this.config[Object.keys(obj)[i]] = obj[Object.keys(obj)[i]];
        }
    }

    save = (type) => {
        var imageMimes = ['png', 'bmp', 'gif', 'jpg', 'jpeg', 'tiff'];
        if (type) {
            if (imageMimes.some(el => type.includes(el))) {
                const image = new Image();
                image.src = this.canvas.toDataURL('image/' + type);
                this.config.onSave.call(this);
                return image;
            } else {
                throw ('No MIME type allowed 😭! Please use ' + imageMimes);
            }
        }
        return this.canvas.toDataURL();
    }

    destroy = () => {
        try {
            this.canvas.parentNode.removeChild(this.canvas);
        } catch (e) {
            console.error('Destroy action: Element no found!');
        }
    }
}
