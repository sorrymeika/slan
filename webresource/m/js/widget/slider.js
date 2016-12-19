﻿var $ = require('$'),
    util = require('util'),
    Touch = require('core/touch');

var Slider = function (options) {
    options = $.extend({
        maxDuration: 400,
        hScroll: true,
        vScroll: false,
        width: '100%',
        index: 0,
        autoLoop: false,
        align: 'center',
        container: null

    }, options);

    $.extend(this, util.pick(options, ['width', 'loop', 'render', 'template', 'itemTemplate', 'navTemplate']));

    var self = this,
        data = options.data,
        itemsHtml = '',
        item,
        $slider;

    if (typeof self.itemTemplate === 'string') self.itemTemplate = util.template(self.itemTemplate);
    if (typeof self.width == 'string') self.width = parseInt(self.width.replace('%', ''));

    if (options.index !== undefined) options.index = options.index;

    this.options = options;

    self.$el = $(self.template());
    self.el = self.$el[0];

    if (options.container) {
        self.$el.appendTo(options.container);
    }

    self.$slider = $slider = self.$el.find('.js_slider');
    self.slider = $slider[0];
    self.$dots = self.$el.find('.js_slide_navs').appendTo(self.$el);

    this.touch = new Touch(self.$el, {
        enableVertical: options.vScroll,
        enableHorizontal: options.hScroll,
        momentum: false
    });

    this.touch.on('start', function () {

        if (self.wrapperW == 0 || self.scrollerW == 0) {
            self.adjustWidth();
        }

        this.maxX = self.scrollerW - self.wrapperW;
        this.minX = 0;

        self.options.autoLoop && self.stopAutoLoop();

    }).on('move', function () {
        self.slider.style.webkitTransform = 'translate3d(' + this.x * -1 + 'px,' + this.y * -1 + 'px,0)';

    }).on('end bounceBack', function (e) {

        if (e.type == 'end' && this.shouldBounceBack()) {
            return;
        }

        var index = e.type == 'bounceBack' ? options.index : this.isMoveLeft && this.x - this.startX > 0 ? options.index + 1 : !this.isMoveLeft && this.x - this.startX < 0 ? options.index - 1 : options.index;

        self._toPage(options.loop ? index : index < 0 ? 0 : index >= self.length ? self.length - 1 : index, e.type == 'bounceBack' ? 0 : 250);

        if (self.options.autoLoop) {
            self.startAutoLoop();
        }
    });

    self.set(data);

    if (options.imagelazyload) {
        self._loadImage();
    }

    if (options.arrow) {
        self._prev = $('<span class="slider-pre js_pre"></span>').appendTo(self.$el);
        self._next = $('<span class="slider-next js_next"></span>').appendTo(self.$el);

        self.$el.on('tap', '.js_pre', function (e) {
            self._toPage(options.index - 1, 250);
        })
            .on('tap', '.js_next', function (e) {
                self._toPage(options.index + 1, 250);
            });
    }

    $(window).on('ortchange', $.proxy(self.adjustWidth, self));

    if (options.autoLoop) {
        self.startAutoLoop();
    }

    self.$el.css({ overflow: '' })
}

$.extend(Slider.prototype, {
    loop: false,
    x: 0,
    itemTemplate: '<a href="<%=url%>" forward><img src="<%=src%>" /></a>',
    renderItem: util.template('<li class="js_slide_item slider-item"><%=$data%></li>'),
    template: util.template('<div class="slider"><ul class="js_slider slider-con"></ul><ol class="js_slide_navs slider-nav"></ol></div>'),

    _loadImage: function () {
        var self = this;

        var item = self.$items.eq(self.options.index);
        if (!item.prop('_detected')) {

            if (self.loop) {
                if (self.options.index == 1) {
                    item = item.add(self.$slider.children(':last-child'));
                } else if (self.options.index == self.length + 1) {
                    item = item.add(self.$slider.children(':first-child'));
                }
            }

            item.find('img[lazyload]').each(function () {
                this.src = this.getAttribute('lazyload');
                this.removeAttribute('lazyload');
            });

            item.prop('_detected', true);
        }
    },

    _adjust: function () {
        var self = this,
            slider = self.$slider,
            children = slider.children(),
            length = children.length;

        self.containerW = self.el.clientWidth;
        self.wrapperW = self.containerW * self.width / 100;
        self.scrollerW = self.wrapperW * length;

        slider.css({ width: length * self.width + '%', marginLeft: '0%' });

        children.css({ width: 100 / length + '%' });

        self.touch.maxX = self.scrollerW;
        self.touch.minX = self.wrapperW * -1;
    },

    adjustWidth: function () {
        var self = this;

        self._adjust();

        self.index(self.options.index)
    },

    _change: function () {
        var self = this,
            options = self.options;

        if (options.onChange) options.onChange.call(self, options.index);

        self._loadImage();

        self.$dots.children().removeClass('curr').eq(options.index).addClass('curr');

    },

    _set: function (data) {
        var self = this,
            itemsHtml = '',
            $slider,
            options = self.options;

        if (!$.isArray(data)) data = data ? [data] : [];
        self._data = data;
        self.length = data.length;

        var dotsHtml = '';
        for (var i = 0, n = data.length; i < n; i++) {
            itemsHtml += self.render(data[i]);
            dotsHtml += '<li class="slider-nav-item"></li>';
        }


        $slider = self.$slider.html(itemsHtml);
        self.$items = $slider.children();

        if (options.dots) {
            self.$dots.html(dotsHtml);
            self.$dots.children().eq(options.index).addClass('curr')
        }

        if (self.length < 2) self.loop = false;
        else if (self.width < 30) self.loop = false;

        if (self.loop) {
            $slider.prepend(self.$items.eq(self.length - 1).clone());
            $slider.append(self.$items.eq(0).clone());
            self.$items = $slider.children();
        }
    },

    prepend: function (data) {
        this._data.unshift(data);
        this.$slider.prepend(this.render(data));
        this._adjust();
    },

    shift: function () {
        this._data.shift();
        this.$slider.children(":first-child").remove();
        this._adjust();
    },

    append: function (data) {
        this._data.push(data);
        this._set(this._data);
    },

    set: function (data) {
        this._set(data);

        this.adjustWidth();
    },

    startAutoLoop: function () {
        var self = this;
        if (self.loopTimer) return;

        self.loopTimer = setTimeout(function () {
            self.index(self.options.index + 1, 300);

            self.loopTimer = setTimeout(arguments.callee, self.options.autoLoop);
        }, self.options.autoLoop);
    },

    stopAutoLoop: function () {
        clearTimeout(this.loopTimer);
        this.loopTimer = null;
    },

    _toPage: function (page, duration) {
        var self = this;
        var index = page > this.$items.length ? 0 : page < -1 ? this.$items.length - 1 : page;
        var x = this.wrapperW * (this.loop ? index + 1 : index);

        self.options.index = page >= self.length ? 0 : page < 0 ? self.length - 1 : page;
        self._change();

        self.touch.scrollTo(x, 0, duration, function () {
            if (self.options.index != index) {
                self.index(page);
            }
        });
    },

    index: function (index, duration) {
        var options = this.options,
            x;

        if (typeof index === 'undefined') return options.index;

        index = index >= this.length ? 0 : index < 0 ? this.length - 1 : index;

        if (this.loop) {
            x = this.wrapperW * (index + 1);

        } else {
            x = this.wrapperW * index;
        }
        if (index != options.index) {
            this._change();
            options.index = index;
        }

        if (x != this.x) this.touch.scrollTo(x, 0, duration);
    },


    data: function (index) {
        return this._data[index || this.options.index];
    },

    appendItem: function () {
        var item = $(this.renderItem(''));
        this.$slider.append(item);
        this.length++;
        this.adjustWidth();

        return item;
    },
    prependItem: function () {
        var item = $(this.renderItem(''));
        this.$slider.prepend(item);
        this.length++;
        this.adjustWidth();

        return item;
    },

    render: function (dataItem) {

        return this.renderItem(this.itemTemplate(dataItem));
    },

    destroy: function () {
        $(window).off('ortchange', this.adjustWidth);
        self.$el.off('tap');
        this.touch.destroy();
    }
})

module.exports = Slider;
