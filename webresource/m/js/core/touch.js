define(function (require, exports, module) {
    var $ = require('$'),
        util = require('util'),
        animation = require('animation'),
        events = require('./event');

    var slice = Array.prototype.slice;

    var Touch = function (el, options, ctx) {
        var that = this,
            $el = $(el);

        that.$el = $el;
        that.el = $el[0];
        that.options = options || {};
        that.ctx = ctx || that;

        $el.on('touchstart', $.proxy(that._start, that))
            .on('touchmove', $.proxy(that._move, that))
            .on('touchend', $.proxy(that._end, that));

        if (that.options.stop) that.on('stop', that.options.stop, that.ctx)
    }

    Touch.prototype = {
        minDelta: 0,

        on: events.on,
        trigger: events.trigger,

        _stopMomentum: function () {
            if (this.momentum) {
                this.momentum.stop && this.momentum.stop();
                this._isClickStopAni = true;
                return true;
            }
            else
                return false;
        },

        _start: function (e) {
            var that = this,
                point = e.touches[0];

            that.pointX = that.startX = that.sx = point.pageX;
            that.pointY = that.startY = that.sy = point.pageY;

            that.isTouchStop = false;
            that.isTouchStart = false;
            that.isTouchMoved = false;

            that.startTime = e.timeStamp || Date.now();

            that.isClickStopMomentum = that._stopMomentum();
            
            console.log('start')
        },
        _move: function (e) {
            if (this.isTouchStop) return;

            var that = this,
                point = e.touches[0],
                deltaX = that.startX - point.pageX,
                deltaY = that.startY - point.pageY,
                timestamp = e.timeStamp || Date.now();

            that.deltaX = deltaX;
            that.deltaY = deltaY;

            that.dx = that.sx - point.pageX;
            that.dy = that.sy - point.pageY;

            if (!that.isTouchStart) {
                var isDirectionX = Math.abs(deltaX) >= that.minDelta && Math.abs(deltaX) > Math.abs(deltaY),
                    isDirectionY = !isDirectionX;

                if (isDirectionY || isDirectionX) {

                    that.isTouchStart = true;
                    that.isDirectionY = isDirectionY;
                    that.isDirectionX = isDirectionX;
                    that.dir = isDirectionX;

                    if (!that.isInit) {
                        if (that.options.init) that.options.init.call(that.ctx);
                        that.isInit = true;
                    }

                    that.options.start.call(that.ctx);

                    if (that.isTouchStop) {
                        return;
                    }
                } else {
                    return false;
                }
            }

            that.options.move.call(that.ctx, deltaX, deltaY);

            that.isTouchMoved = true;

            that.isMoveLeft = that.pointX - point.pageX > 0 ? true : that.pointX == point.pageX ? that.isMoveLeft : false;
            that.isMoveTop = that.pointY - point.pageY > 0 ? true : that.pointY == point.pageY ? that.isMoveTop : false;

            that.pointX = point.pageX;
            that.pointY = point.pageY;

            if (timestamp - that.startTime > 300) {
                that.startTime = timestamp;
                that.startX = point.pageX;
                that.startY = point.pageY;

                if (that.options.resetStartTime) that.options.resetStartTime.call(that.ctx);
            }

            return false;
        },

        stop: function () {
            this.isTouchStop = true;
        },

        addMomentumOptions: function (start, current, min, max, size, divisor, dir) {
            this.momentumOptions.push([start || 0, current || 0, this.duration, min || 0, max || 0, size || 0, divisor, dir]);
            return this;
        },

        _momentum: function () {
            if (this.options.momentum) this.options.momentum.apply(this.ctx, arguments);
        },

        _stop: function () {
            this.momentum = null;
            this._isClickStopAni = false;
            this.trigger('stop');
        },

        _end: function (e) {
            var that = this;

            if ((!that.isTouchMoved || that.isTouchStop) && that._isClickStopAni) {
                that.momentum.finish();
                that._isClickStopAni = false;
                e.cancelTap = true;
                return;// !that.isClickStopMomentum;
            }

            if (!that.isTouchMoved) return;
            that.isTouchMoved = false;

            if (that.isTouchStop) return;
            that.isTouchStop = true;

            $(e.target).trigger('touchcancel');

            var point = e.changedTouches[0],
                target,
                duration = (e.timeStamp || Date.now()) - that.startTime;

            that.duration = duration;

            var endEvent = events.createEvent('end')
            this.trigger(endEvent);

            if (endEvent.isDefaultPrevented()) {
                return false;
            }

            if (duration < 300 || !that.momentum) {

                that.momentumOptions = [];
                if (that.options.beforeMomentum) that.options.beforeMomentum.call(that.ctx, duration);

                that.momentum = animation.momentum(that.momentumOptions, that.options.maxDuration, that._momentum, that.options.ease || 'ease', that._stop, that);

            } else {
                that.momentum.finish();
            }

            return false;
        },

        destory: function () {
            this.$el.off('touchstart', this._start)
                .off('touchmove', this._move)
                .off('touchend', this._end)
        }
    }

    return Touch;

});
