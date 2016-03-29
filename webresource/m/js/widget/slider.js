define(function(require, exports, module) {
    var $ = require('$'),
        _ = require('util'),
        ScrollView = require('./scrollview');

    var Slider = function(el, options) {
        options = $.extend({
            maxDuration: 400,
            ease: 'ease-out',
            hScroll: true,
            vScroll: false,
            width: '100%',
            index: 0,
            autoLoop: false,
            align: 'center'

        }, options);

        $.extend(this, _.pick(options, ['width', 'loop', 'render', 'template', 'itemTemplate', 'navTemplate']));

        var that = this,
            data = options.data,
            itemsHtml = '',
            item,
            $slider;

        if (typeof that.itemTemplate === 'string') that.itemTemplate = _.template(that.itemTemplate);
        if (typeof that.width == 'string') that.width = parseInt(that.width.replace('%', ''));

        if (options.index != undefined) options.index = options.index;

        ScrollView.call(this, $(that.template).appendTo($(el)), options);

        options = this.options;

        that.touch.on('stop', that.stop, that);

        $slider = that.$slider = that.$el.find('.js_slider');

        that.$dots = that.$el.find('.js_slide_navs').appendTo(that.$el);

        if (options.imagelazyload) {
            that.bind("Change", function() {
                that._loadImage();
            });
            that._loadImage();
        }

        if (options.arrow) {
            that._prev = $('<span class="slider-pre js_pre"></span>').appendTo(that.$el);
            that._next = $('<span class="slider-next js_next"></span>').appendTo(that.$el);

            that.$el.on('tap', '.js_pre', function(e) {
                that.index(options.index - 1, 300);
            })
                .on('tap', '.js_next', function(e) {
                    that.index(options.index + 1, 300);
                });
        }

        $(window).on('ortchange', $.proxy(that._adjustWidth, that));

        that.set(data);

        if (options.autoLoop) {
            that.startAutoLoop();
        }

        that.$el.css({ overflow: '' })
    }

    $.extend(Slider.prototype, ScrollView.prototype, {
        loop: false,
        x: 0,
        renderItem: _.template('<li class="js_slide_item slider-item"><%=$data%></li>'),
        itemTemplate: '<%= %>',
        template: '<div class="slider"><ul class="js_slider slider-con"></ul><ol class="js_slide_navs slider-nav"></ol></div>',

        _set: function(data) {
            var that = this,
                itemsHtml = '',
                $slider,
                options = that.options;

            if (!$.isArray(data)) data = [data];
            that._data = data;
            that.length = data.length;

            var dotsHtml = '';
            for (var i = 0, n = data.length; i < n; i++) {
                itemsHtml += that.render(data[i]);
                dotsHtml += '<li class="slider-nav-item"></li>';
            }

            $slider = that.$slider.html(itemsHtml);
            that.$items = $slider.children();
            that.slider = $slider[0];

            if (options.dots) {
                that.$dots.html(dotsHtml);
                that.$dots.children().eq(options.index).addClass('curr')
            }

            //that.index=index== -1?that.length%2==0?that.length/2-1:Math.floor(that.length/2):index;
            if (that.length < 2) that.loop = false;
            else if (that.width < 100) that.loop = false;

            var length;
            if (that.loop) {
                $slider.prepend(that.$items.eq(that.length - 1).clone());
                $slider.append(that.$items.eq(0).clone());
                that.$items = $slider.children();
                options.index++;
            } else {
                length = that.length;
            }

        },

        prepend: function(data) {
            this._data.unshift(data);
            this.$slider.prepend(this.render(data));
            this._adjust();
            this.startLeft += this.wrapperW;
        },

        append: function(data) {
            this._data.push(data);
            this._set(this._data);
            this._adjust();
        },

        set: function(data) {
            this._set(data);

            this._adjustWidth();
            this.index(this.options.index);
        },

        startAutoLoop: function() {
            var that = this;
            if (that.loopTimer) return;

            that.loopTimer = setTimeout(function() {
                that.index(that.options.index + 1);

                that.loopTimer = setTimeout(arguments.callee, that.options.autoLoop);
            }, that.options.autoLoop);
        },

        stopAutoLoop: function() {
            clearTimeout(this.loopTimer);
            this.loopTimer = null;
        },

        start: function() {
            var that = this,
                touch = that.touch,
                index = this._getIndex();

            if (!that.options.hScroll && touch.isDirectionX || !that.options.vScroll && touch.isDirectionY) {
                touch.stop();
                return;
            }

            that.maxX = Math.min(that.scrollerW - that.wrapperW, Math.min(index + 1, that.loop ? index + 1 : (that.length - Math.floor(that.containerW / that.wrapperW))) * that.wrapperW);
            that.minX = Math.max(0, (index - 1) * that.wrapperW);
            that._startLeft = that.startLeft = that.x;

            that.stopAutoLoop();
        },

        index: function(index, duration) {
            var options = this.options,
                x,
                changeFlag;

            if (typeof index === 'undefined') return options.index;

            index = index >= this.$items.length ? 0 : index < 0 ? this.$items.length - 1 : index;

            if (this.loop) {
                if (index == 0) {
                    index = this.$items.length - 2;
                    this.maxX = x = index * this.wrapperW;
                } else if (index == this.$items.length - 1) {
                    index = 1;
                    this.minX = x = index * this.wrapperW;
                }
            }

            if (options.index != index) {
                this.currentData = this._data[this.loop ? index - 1 : index];
                options.index = index;
                this._change();
            }

            x = index * this.wrapperW;
            this.maxX = x;

            this.scrollTo(x, 0, duration);
        },
        _getIndex: function() {
            var index = Math.round(this.x / this.wrapperW);

            return index || 0;
        },
        data: function(index) {
            return this._data[index || this.options.index];
        },
        appendItem: function() {
            var item = $(this.renderItem(''));
            this.$slider.append(item);
            this.length++;
            this._adjustWidth();

            return item;
        },
        prependItem: function() {
            var item = $(this.renderItem(''));
            this.$slider.prepend(item);
            this.length++;
            this._adjustWidth();

            return item;
        },
        render: function(dataItem) {
            return this.renderItem(this.itemTemplate(dataItem));
        },

        stop: function() {
            var that = this;
            var x = that.x;
            var index = this._getIndex();

            that.index(index);

            if (that.options.autoLoop) {
                that.startAutoLoop();
            }
            that.trigger('stop');
        },
        _loadImage: function() {
            var that = this;

            var item = that.$items.eq(that.options.index);
            if (!item.prop('_detected')) {

                if (that.loop) {
                    if (that.options.index == 1) {
                        item = item.add(that.$slider.children(':last-child'));
                    } else if (that.options.index == that.length + 1) {
                        item = item.add(that.$slider.children(':first-child'));
                    }
                }

                item.find('img[lazyload]').each(function() {
                    this.src = this.getAttribute('lazyload');
                    this.removeAttribute('lazyload');
                });

                item.prop('_detected', true);
            }
        },

        _adjust: function() {
            var that = this,
                slider = that.$slider,
                children = slider.children(),
                length = children.length;

            that.containerW = that.el.clientWidth;
            that.wrapperW = that.containerW * that.width / 100;
            that.scrollerW = that.wrapperW * length;

            slider.css({ width: length * that.width + '%', marginLeft: this.options.align == 'center' ? (100 - that.width) / 2 + '%' : '0%' });

            that.divisorX = that.wrapperW;

            children.css({ width: 100 / length + '%' });
        },
        _adjustWidth: function() {
            var that = this;

            that._adjust();

            that.x = that.wrapperW * that.options.index;
            that.$scroller.css({ '-webkit-transform': 'translate(' + (-that.x) + 'px,0px) translateZ(0)' });
        },

        _change: function() {
            var that = this,
                options = that.options,
                index = that.loop ? options.index - 1 : options.index;

            if (options.onChange) options.onChange.call(that, index);
            that.trigger('change', index, that.currentData);

            that.$dots.children().removeClass('curr').eq(index).addClass('curr')
        },

        destory: function() {
            $(window).off('ortchange', this._adjustWidth);
            that.$el.off('tap');
            this.touch.destory();
        }
    })

    module.exports = Slider;
});
