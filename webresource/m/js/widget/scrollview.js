define(function (require, exports, module) {
    var $ = require('$'),
        animation = require('core/animation'),
        event = require('core/event'),
        Touch = require('core/touch');
    var util = require('util');

    var addScroller = function ($el) {
        return $('<div class="scroller_container" style="width:100%;"></div>').append($el.children()).appendTo($el.html(''));
    };

    var ScrollView = function (el, options) {
        var that = this;

        that.options = options = $.extend({}, that.options, options);

        that.$el = $(el).css({ overflow: 'hidden' });
        that.el = that.$el[0];

        that.$scroller = addScroller(that.$el);
        that.scroller = that.$scroller[0];

        that.touch = new Touch(that.$el, that, that);
        that.touch.on('end', function () {
            that.trigger('end');
        });
    }

    ScrollView.prototype = {
        options: {
            ease: 'ease',
            hScroll: true,
            vScroll: true
        },
        off: event.off,
        on: event.on,
        trigger: event.trigger,
        init: function () {
            var matrix = this.$scroller.matrix();
            
            this.x = -matrix[4];
            this.minX = 0;

            this.y = -matrix[5];
            this.minY = 0;
        },
        start: function () {
            var that = this,
                touch = that.touch;

            that.wrapperW = that.el.clientWidth;
            that.scrollW = that.scroller.offsetWidth;
            that.maxX = Math.max(that.scrollW - that.wrapperW, 0);
            that._startLeft = that.startLeft = that.x

            that.wrapperH = that.el.clientHeight;
            that.scrollH = that.scroller.offsetHeight;
            that.maxY = Math.max(that.scrollH - that.wrapperH, 0);
            that._startTop = that.startTop = that.y;

            if ((!that.options.hScroll || that.wrapperW >= that.scrollW) && touch.isDirectionX || (!that.options.vScroll || that.wrapperH >= that.scrollH) && touch.isDirectionY) {
                touch.stop();
                return;
            }
        },
        stop: function () {
            this.$el.triggerHandler('scrollStop', [0, this.y]);
        },
        resetStartTime: function () {
            if (this.options.hScroll) {
                this.startLeft = this.startLeft + this.touch.deltaX;
                this._startLeft = this.x;
            }

            if (this.options.vScroll) {
                this.startTop = this.startTop + this.touch.deltaY;
                this._startTop = this.y;
            }
        },
        move: function () {
            

            if (this.options.hScroll) {
                var newX = this.startLeft + this.touch.deltaX;
                if (newX < this.minX || newX > this.maxX) {
                    if (this.options.vScroll) newX = newX < this.minX ? this.minX : this.maxX;
                    else newX = newX < this.minX ? newX + (this.minX - newX) / 2 : (newX + (this.maxX - newX) / 2);
                }
                this.x = newX;
            }

            if (this.options.vScroll) {
                var newY = this.startTop + this.touch.deltaY;
                if (newY < this.minY || newY > this.maxY) {
                    newY = newY < this.minY ? newY + (this.minY - newY) / 2 : (newY + (this.maxY - newY) / 2);
                }
                this.y = newY;
            }

            this.$scroller.css({ '-webkit-transform': 'translate(' + (-this.x) + 'px,' + (-this.y) + 'px) translateZ(0)' });

            this.trigger('move', {
                x: this.x,
                y: this.y
            })

        },
        beforeMomentum: function () {
            this.touch.addMomentumOptions(this._startLeft, this.x, this.minX, this.maxX, this.wrapperW, this.divisorX, this.touch.isMoveLeft ? 'left' : 'right')
                .addMomentumOptions(this._startTop, this.y, this.minY, this.maxY, this.wrapperH);
        },
        momentum: function (a, b) {
            this.x = a.current;
            this.y = b ? (b.current || 0) : 0;

            this.$scroller.css({ '-webkit-transform': 'translate(' + (-this.x) + 'px,' + (-this.y) + 'px) translateZ(0)' });
        },
        scrollTo: function (x, y, duration) {
            this.x = x > this.maxX ? this.maxX : x < this.minX ? this.minX : x;
            this.y = y > this.maxY ? this.maxY : y < this.minY ? this.minY : y;

            var css = { '-webkit-transform': 'translate(' + (-this.x) + 'px,' + (-this.y) + 'px) translateZ(0)' };

            !duration ? this.$scroller.css(css) : this.$scroller.animate(css, duration, 'ease-out');
        },
        destory: function () {
            this.touch.destory();
        }
    };

    ScrollView.addScroller = addScroller;

    module.exports = ScrollView;
});
