var $ = require('$');
var util = require('util');
var Promise = require('promise');
var Touch = require('core/touch');
var Model = require('core/model2').Model;
var Scroll = require('../widget/scroll');

var Tab = Model.extend({
    el: <div class="cp_tab {className}">
        <div class="cp_tab__head bottom_border">
            <ul class="cp_tab__head_con">
                <li class="cp_tab__head_item{index==i?' curr':''}" sn-repeat="item,i in items" ref="heads" sn-tap="this.tab(i)">{item}</li>
            </ul>
            <div class="cp_tab__cursor" style="width:{cursorWidth}px;-webkit-transform:translate3d({cursorX}px,0px,0px)"></div>
        </div>
        <div class="cp_tab__body" ref="body">
            <div class="cp_tab__content" style="width:{items.length*100}%" ref="content">
                <div class="cp_tab__item" style="width:{100/items.length}%" sn-repeat="item,i in items" ref="items">{this.children[i]}</div>
            </div>
        </div>
    </div>,

    defaultData: {
        index: 0,
        cursorX: 0
    },

    viewDidUpdate: function () {
        var self = this;
        this.wapperW = this.refs.body.offsetWidth;
        this.touch.maxX = this.refs.content.offsetWidth - this.wapperW;

        this.refs.items.forEach(function (item) {
            if (!item.scroll)
                self.bindScrollTo(item);
        });

        if (!this.data.cursorWidth)
            this.refs.heads[this.data.index] && this.set({
                cursorWidth: this.refs.heads[this.data.index].offsetWidth
            });
    },

    initialize: function (data) {

        var self = this;

        this.touch = new Touch(this.refs.body, {
            enableVertical: false,
            enableHorizontal: true,
            momentum: false
        });

        this.touch.on('start', function () {

            this.minX = 0;

        }).on('move', function () {

            self.refs.content.style.webkitTransform = 'translate3d(' + this.x * -1 + 'px,' + this.y * -1 + 'px,0)';

            var x = this.x % self.wapperW;

            if (x != 0) {
                var percent = this.isMoveLeft ? x / self.wapperW : (1 - x / self.wapperW);
                var index = self.fix(this.isMoveLeft ? Math.ceil(this.x / self.wapperW) : Math.floor(this.x / self.wapperW));
                var currentIndex = self.fix(this.isMoveLeft ? Math.floor(this.x / self.wapperW) : Math.ceil(this.x / self.wapperW));
                if (currentIndex == index) return;

                var currentHead = self.refs.heads[currentIndex];
                var currentHeadWidth = currentHead.offsetWidth;
                var currentHeadX = currentHead.offsetLeft;

                var nextHead = self.refs.heads[index];
                var nextHeadLeft = nextHead.offsetLeft;

                self.set({
                    cursorX: currentHeadX + (nextHeadLeft - currentHeadX) * percent,
                    cursorWidth: currentHeadWidth + (nextHead.offsetWidth - currentHeadWidth) * percent
                });
            }

        }).on('end bounceBack', function (e) {

            if (e.type == 'end' && this.shouldBounceBack()) {
                return;
            }

            var index = e.type == 'bounceBack'
                ? self.data.index
                : this.isMoveLeft && this.x - this.startX > 0
                    ? self.data.index + 1
                    : !this.isMoveLeft && this.x - this.startX < 0
                        ? self.data.index - 1
                        : self.data.index;

            self.tab(index < 0 ? 0 : index >= self.data.items.length ? self.data.items.length - 1 : index, e.type == 'bounceBack' ? 0 : 250);
        });

        this.promise = new Promise(function (resove) {
            self.next(resove);
        });

        this.on('change:index', function (e, value) {
            this.tab(value);
        });
    },

    fix: function (index) {
        return index < 0 ? 0 : index >= this.data.items.length ? this.data.items.length - 1 : index;
    },

    tab: function (page, duration) {
        var self = this;
        var index = page >= this.data.items.length ? 0 : page < 0 ? this.data.items.length - 1 : page;

        this.promise.then(function () {
            var scrollLeft = self.refs.body.offsetWidth * index;

            if (scrollLeft != self.touch.x) {
                self.touch.scrollTo(scrollLeft, 0, duration, function () {
                    if (index !== self.data.index) {
                        self.trigger('tabChange', index, self.data.index);
                    }
                    self.set({
                        index: index,
                        cursorX: self.refs.heads[index].offsetLeft,
                        cursorWidth: self.refs.heads[index].offsetWidth
                    });
                });
            }
        });
    }

});

module.exports = Tab;
