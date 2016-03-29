var $ = require('$'),
    util = require('util'),
    animation = require('./animation'),
    CubicBezier = require('../graphics/cubicBezier'),
    Event = require('./event');

var slice = Array.prototype.slice;
var cb = new CubicBezier(.08, .53, .2, .96);

var Touch = function (el, options) {
    var self = this,
        $el = $(el);

    self.$el = $el;
    self.el = $el[0];
    self.options = $.extend({
        enableVertical: true,
        enableHorizontal: false,
        divisorX: 0,
        divisorY: 100,
        maxDuration: 0

    }, options);

    this.delegate('touchstart', self.options.children, self._start)
        .delegate('touchmove', self.options.children, self._move)
        .delegate('touchend', self.options.children, self._end);
}

Touch.prototype = Object.create(Event);

$.extend(Touch.prototype, {
    minDelta: 0,
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
    x: 0,
    y: 0,

    delegate: function (event, sub, fn) {
        if (typeof sub == 'undefined' && typeof fn == 'function')
            sub = fn;

        (typeof sub == 'function') ?
            this.$el.on(event, $.proxy(sub, this)) :
            this.$el.on(event, sub, $.proxy(fn, this));
        return this;
    },

    _stopMomentum: function () {
        if (this.momentum) {
            this.momentum.stop();
            this._isClickStopAni = true;
            return true;
        }
        else
            return false;
    },

    _start: function (e) {
        var self = this,
            point = e.touches[0];

        self.pointX = self.startPointX = self.sx = point.pageX;
        self.pointY = self.startPointY = self.sy = point.pageY;

        self.isTouchStop = false;
        self.isTouchStart = false;
        self.isTouchMoved = false;

        self.startTime = e.timeStamp || Date.now();

        self.startX = self.x;
        self.startY = self.y;

        self.prevPointX = self.prevPointY = 0;

        self.isClickStopMomentum = self._stopMomentum();

        self.timestamp = Date.now();
    },

    _move: function (e) {
        if (this.isTouchStop) return;

        var self = this,
            point = e.touches[0],
            deltaX = self.startPointX - point.pageX,
            deltaY = self.startPointY - point.pageY,
            x,
            y;

        self.deltaX = deltaX;
        self.deltaY = deltaY;

        if (!self.isTouchStart) {
            var isDirectionX = Math.abs(deltaX) >= self.minDelta && Math.abs(deltaX) > Math.abs(deltaY),
                isDirectionY = !isDirectionX;

            if (isDirectionY || isDirectionX) {

                if (isDirectionY && !self.options.enableVertical || isDirectionX && !self.options.enableHorizontal) {
                    this.stop();
                    return;
                }

                self.isTouchStart = true;
                self.isDirectionY = isDirectionY;
                self.isDirectionX = isDirectionX;
                self.dir = isDirectionX;

                if (!self.isInit) {
                    self.trigger(Event.createEvent('init', {
                        currentTarget: e.currentTarget
                    }));
                    self.isInit = true;
                }
                self.trigger(Event.createEvent('start', {
                    currentTarget: e.currentTarget
                }));

                if (self.isTouchStop) {
                    return;
                }
            } else {
                return false;
            }
        }


        if (self.options.enableHorizontal) {
            x = self.startX + deltaX;
            self.x = x < self.minX ? self.minX + (x - self.minX) / 2 : x > self.maxX ? self.maxX + (x - self.maxX) / 2 : x;
        }

        if (self.options.enableVertical) {
            y = self.startY + deltaY;
            self.y = y < self.minY ? self.minY + (y - self.minY) / 2 : y > self.maxY ? self.maxY + (y - self.maxY) / 2 : y;
        }

        self.trigger(Event.createEvent('move', {
            currentTarget: e.currentTarget
        }));

        self.isTouchMoved = true;

        self.isMoveLeft = self.pointX - point.pageX > 0 ? true : self.pointX == point.pageX ? self.isMoveLeft : false;
        self.isMoveTop = self.pointY - point.pageY > 0 ? true : self.pointY == point.pageY ? self.isMoveTop : false;

        self.prevPointX = self.oldPointX;
        self.prevPointY = self.oldPointY;

        self.oldPointX = self.pointX;
        self.oldPointY = self.pointY;

        self.pointX = point.pageX;
        self.pointY = point.pageY;

        self.timestamp = Date.now();

        return false;
    },

    shouldBounceBack: function () {
        var self = this;
        return self.options.enableHorizontal && (self.x < self.minX || self.x > self.maxX) || self.options.enableVertical && (self.y < self.minY || self.y > self.maxY);
    },

    _end: function (e) {
        var self = this;

         if ((!self.isTouchMoved || self.isTouchStop) && self._isClickStopAni) {
            if (self.shouldBounceBack()) {
                self.bounceBack();
            }
            self._stop();
            e.cancelTap = true;
            console.log('cancelTap',e.cancelTap)
            return;
        }

        if (!self.isTouchMoved) return;
        self.isTouchMoved = false;

        if (self.isTouchStop) return;
        self.isTouchStop = true;

        $(e.target).trigger('touchcancel');
        self.trigger('end');

        if (self.shouldBounceBack()) {
            self.bounceBack();
            return;
        }

        var point = e.changedTouches[0],
            changeX,
            changeY,
            currentX = self.x,
            currentY = self.y,
            distX = 0,
            distY = 0,
            x,
            y,
            duration,
            resultX,
            resultY;

        if (Date.now() - self.timestamp < 50) {
            changeX = point.pageX - (self.prevPointX || self.oldPointX);
            changeY = point.pageY - (self.prevPointY || self.oldPointY);

            distX = changeX * Math.abs(changeX) / -4;
            distY = changeY * Math.abs(changeY) / -4;

            duration = Math.max(Math.abs(changeX), Math.abs(changeY), 10) * 100;
        }

        console.log(distY)

        if (self.options.divisorX) {

            resultX = distX + currentX;

            distX = resultX % self.options.divisorX == 0 ? distX :
                self.isMoveLeft ? Math.ceil(resultX / self.options.divisorX) * self.options.divisorX - currentX :
                    (Math.floor(resultX / self.options.divisorX) * self.options.divisorX - currentX);
        }

        if (self.options.divisorY) {
            resultY = distY + currentY;

            distY = resultY % self.options.divisorY == 0 ? distY :
                self.isMoveTop ? Math.ceil(resultY / self.options.divisorY) * self.options.divisorY - currentY :
                    (Math.floor(resultY / self.options.divisorY) * self.options.divisorY - currentY);

            console.log(resultY, distY, self.isMoveTop, Math.ceil(resultY / self.options.divisorY) * self.options.divisorY);
        }

        if (distX || distY) {

            !duration && (duration = 200) || self.options.maxDuration && duration > self.options.maxDuration && (duration = self.options.maxDuration); 
            
            //惯性移动
            self.momentum = animation.animate(function (d, current, duration) {
                d = cb.get(current / duration);
                x = currentX + distX * d;
                y = currentY + distY * d;

                if (self.options.enableVertical && (y < self.minY || y > self.maxY) || (self.options.enableHorizontal && !self.options.enableVertical && (x < self.minX || x > self.maxX))) {
                    self.momentum && self.momentum.stop();

                    distX = currentX + distX;
                    distY = currentY + distY;

                    currentX = self.x;
                    currentY = self.y;

                    distX = distX < self.minX ? self.minX + Math.max(-80, (distX - self.minX) / 36) : distX > self.maxX ? self.maxX + Math.min(100, (distX - self.maxX) / 36) : distX;
                    distY = distY < self.minY ? self.minY + Math.max(-80, (distY - self.minY) / 36) : distY > self.maxY ? self.maxY + Math.min(100, (distY - self.maxY) / 36) : distY;

                    distY -= currentY;
                    distX -= currentX;

                    //当前惯性移动的值超过阀值减速移动
                    self.momentum = animation.animate(function (d) {
                        self.options.enableHorizontal && (self.x = currentX + distX * d);
                        self.options.enableVertical && (self.y = currentY + distY * d);

                        self.trigger('move');

                    }, Math.min(200, (duration - current) / 4), 'easeOutCubic', function () {
                        self.bounceBack();
                    });

                } else {
                    self.options.enableHorizontal && (self.x = x < self.minX ? self.minX : x > self.maxX ? self.maxX : x);
                    self.options.enableVertical && (self.y = y);
                    self.trigger('move');
                }

            }, duration, 'ease', function () {
                self._stop();
            });
        } else {
            self._stop();
        }

        return false;
    },

    bounceBack: function () {
        var self = this;
        var currentX = self.x;
        var currentY = self.y;
        var distX = 0;
        var distY = 0;

        if (self.options.enableHorizontal) {
            if (self.x < self.minX) {
                distX = self.minX - self.x;
            }
            else if (self.x > self.maxX) {
                distX = self.maxX - self.x;
            }
        }
        if (self.options.enableVertical) {
            if (self.y < self.minY) {
                distY = self.minY - self.y;
            }
            else if (self.y > self.maxY) {
                distY = self.maxY - self.y;
            }
        }
        animation.animate(function (d) {
            self.x = currentX + distX * d;
            self.y = currentY + distY * d;

            self.trigger('move');

        }, 200, 'ease', function () {
            self._stop();
        });
    },

    scrollTo: function (x, y, duration) {
        var self = this;
        x = self.options.enableHorizontal ?
            x >= this.maxX ? this.maxX : x <= this.minX ? this.minX : x
            : self.x;

        y = self.options.enableVertical ?
            y >= this.maxY ? this.maxY : y <= this.minY ? this.minY : x
            : self.x;

        if (!duration) {
            self.x = x;
            self.y = y;

            self.trigger('move');
        } else {
            var currentX = self.x;
            var currentY = self.y;
            var distX = x - self.x;
            var distY = y - self.x;
            animation.animate(function (d) {
                self.x = currentX + distX * d;
                self.y = currentY + distY * d;

                self.trigger('move');

            }, duration, 'ease');
        }
    },

    stop: function () {
        this.isTouchStop = true;
    },

    _stop: function () {
        this.momentum = null;
        this._isClickStopAni = false;
        this.trigger('stop');
    },

    destory: function () {
        this.$el.off('touchstart', this._start)
            .off('touchmove', this._move)
            .off('touchend', this._end)
    }
})

module.exports = Touch;

