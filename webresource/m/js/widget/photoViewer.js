var Model = require('core/model2').Model;
var $ = require('$');
var Scroll = require('./scroll');
var util = require('util');

module.exports = Model.extend({
    el: (<div class="cp_photoviewer" sn-tap="this.resetSize()" sn-touchstart="this.touchStart()" sn-touchmove="this.touchMove()" sn-touchend="this.touchEnd()">
        <ul class="cp_photoviewer__con" ref="content" style="-webkit-transform:translate({x}px,0px);width:{images.length*100}%">
            <li class="cp_photoviewer__item" sn-repeat="item in images"><div class="cp_photoviewer__item_con" ref="items"><p ref="bds"><img style="-webkit-transform:translate(-50%,-50%) rotate({item.r}deg) scale({item.s});-webkit-transform-origin: 50% 50%;" sn-src="{item.src}" ref="images" /></p></div></li>
        </ul>
    </div>),
    defaultData: {
        card: 0,
        x: 0,
        y: 0,
        r: 0,
        s: 1,
        index: 0,
        images: []
    },

    index: function (index) {
        if (index === undefined) return this.data.index;

        console.log(this.data.index * (this.$el.offsetWidth || window.innerWidth));

        this.set({
            x: -1 * index * (this.$el.offsetWidth || window.innerWidth),
            index: index
        })
    },

    resetSize: function () {
        this.currentItem.set({
            s: 1
        })
    },

    setImages: function (images) {

        images.forEach(function (img) {

            img.r = 0;
            img.s = 1;
        });

        this.set({
            images: images
        })
    },

    initialize: function () {
        var self = this;
        this._start = this._start.bind(this);
        this._move = this._move.bind(this);
        this._end = this._end.bind(this);

        this.getModel('images').each(function (model) {
            model.set({
                r: 0,
                s: 1
            })
        });
        this.set({
            x: -1 * this.data.index * (this.$el.offsetWidth || window.innerWidth)
        })

    },

    viewDidUpdate: function () {
        var self = this;

        this.refs.items && this.refs.items.forEach(function (item) {
            if (!item.scroll) {
                self.bindScrollTo(item, {
                    hScroll: true,
                    vScroll: true
                });
                $(item).on('touchstart', self._start).on('touchmove', self._move).on('touchend', self._end);
            }
        });
    },

    _start: function (e) {
        this.__startScrollX = e.currentTarget.scrollLeft;
        this.__sx = this.__lastX = e.touches[0].pageX;
        this.__sy = this.__lastY = e.touches[0].pageY;
        this.__isPreventScroll = -1;
        this.__isY = -1;
    },

    _move: function (e) {
        if (e.touches.length == 2) {
            return;
        }
        var el = e.currentTarget;

        if (this.__isY == -1) {
            if (Math.abs(e.touches[0].pageY - this.__lastY) > Math.abs(e.touches[0].pageX - this.__lastX)) {
                this.__isY = true;
                return;
            }
            this.__isY = false;

        } else if (this.__isY) {
            return;
        }

        var isMoveLeft = e.touches[0].pageX < this.__lastX;

        this.__lastX = e.touches[0].pageX;
        this.isMoveLeft = isMoveLeft;

        if (this.__isPreventScroll === -1) {

            if ((isMoveLeft && this.__startScrollX >= el.scrollWidth - el.clientWidth) || (!isMoveLeft && this.__startScrollX <= 0)) {

                this.__isPreventScroll = true;
                this.originX = this.data.x;

            } else {
                this.__isPreventScroll = false;
            }
        }

        if (this.__isPreventScroll === true) {
            e.preventDefault();
            this.touchMove(e);
        }
    },

    _end: function (e) {
        if (this.__isPreventScroll)
            this.touchEnd(e);
    },

    touchStart: function (e) {
        var touches = e.touches;

        this.startTouches = [].map.call(touches, function (item) {
            return {
                x: item.pageX,
                y: item.pageY
            }
        });

        this.isStart = true;
        this.touchLen = -1;

        this.originX = this.data.x;
        this.originY = this.data.y;

        this.originR = this.data.r;

        console.log(this.data);

        this.currentItem = this._('images[' + this.data.index + ']');
        console.log(this.currentItem);
        this.originR = this.currentItem.get("r");
        this.originS = this.currentItem.get("s");

        this.currentEl = this.refs.items[this.data.index];
        this.currentImage = this.refs.images[this.data.index];
        this.currentBd = this.refs.bds[this.data.index];

        if (touches.length == 2) {
            var w = touches[0].pageX - touches[1].pageX;
            var h = touches[0].pageY - touches[1].pageY;
            this.startR = 180 * Math.atan2(h, w) / Math.PI;
            this.startL = Math.sqrt(w * w + h * h);
        }
    },

    touchMove: function (e) {
        var self = this;

        if (!this.isStart) return;

        var touches = e.touches;

        if (this.touchLen != -1) {
            if (this.touchLen != touches.length) {
                this.isStart = false;
                return;
            }

        } else
            this.touchLen = touches.length;


        $(e.target).trigger('touchcancel');

        if (this.touchLen == 1) {
            if (this.isTwo) return;

            var dx0 = touches[0].pageX - this.startTouches[0].x;
            var dy0 = touches[0].pageY - this.startTouches[0].y;
            var x = self.originX + dx0;
            var width = this.$el[0].offsetWidth - this.refs.content.offsetWidth;

            self.set({
                x: x > 0 ? x / 2 : x < width ? width + (x - width) / 2 : x,
                y: self.originY + dy0
            });

        } else {

            var w = touches[0].pageX - touches[1].pageX;
            var h = touches[0].pageY - touches[1].pageY;
            var r = 180 * Math.atan2(h, w) / Math.PI;
            var l = Math.sqrt(w * w + h * h);

            self.currentItem.set({
                s: self.originS * (l / this.startL)
                //r: self.originR + (r - this.startR)
            });
        }

        return false;
    },

    touchEnd: function (e) {
        //var touches = e.changedTouches;

        this.isStart = false;
        var self = this;
        var elWidth = this.$el[0].offsetWidth;
        var elHeight = this.$el[0].offsetHeight;

        if (this.touchLen == 1) {
            $(this.refs.content).addClass('anim_ease')[0].clientHeight;

            var width = elWidth - this.refs.content.offsetWidth;
            var x = this.data.x;
            var cX = this.data.index * elWidth * -1;

            x = x > 0 ? 0 : x < width ? width : x < cX && this.isMoveLeft ? cX - elWidth : x > cX && !this.isMoveLeft ? cX + elWidth : cX;

            var index = x * -1 / elWidth;
            var indexChanged = index !== this.data.index;

            this.set({
                x: x,
                index: index

            }).next(function () {
                setTimeout(function () {
                    $(self.refs.content).removeClass('anim_ease');

                    if (indexChanged) {
                        self.currentItem.set({
                            s: 1
                        });
                        self.currentBd.style.width = '100%';
                        self.currentBd.style.height = '100%';
                    }
                }, 300)
            });

        } else {

            var width = self.currentImage.offsetWidth * self.currentItem.data.s;
            var height = self.currentImage.offsetHeight * self.currentItem.data.s;

            if (width > elWidth) {
                this.currentBd.style.width = width + 'px';

                this.currentEl.scrollLeft = (width - elWidth) / 2;

            } else {
                this.currentBd.style.width = '100%';
            }
            if (height > elHeight) {
                this.currentBd.style.height = height + 'px';
                this.currentEl.scrollTop = (height - elHeight) / 2;

            } else {
                this.currentBd.style.height = '100%';
            }

        }
    }

});
