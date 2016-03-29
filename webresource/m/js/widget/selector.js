define(function (require, exports, module) {
    var $ = require('$'),
        util = require('util'),
        Scroll = require('./scrollview');

    var SelectorItem = function (options) {
        var that = this;

        Scroll.call(this, this.el, options);

        $.extend(this, util.pick(options, ['itemHeight', 'template']));

        if (typeof this.template == 'string') this.template = util.template(this.template);

        options = this.options;
        var data = options.data || [];

        options.onChange && this.on("Change", options.onChange);

        this.$scroller.addClass('selectorcon');
        this.$content = $('<ul></ul>').appendTo(this.$scroller);

        this.set(data);

        if (options.value) this.val(options.value);
    };

    SelectorItem.prototype = Object.create(Scroll.prototype);

    $.extend(SelectorItem.prototype, {
        options: {
            bounce: false,
            hScroll: false,
            vScroll: true
        },

        init: function () {
        },

        el: '<div></div>',

        template: util.template('<li><%=text%></li>'),

        set: function (data) {
            var that = this;
            var html = '';
            $.each(data, function (i, item) {
                html += that.template(item);
            });

            this.data = data;
            this.selectedData = data && data.length ? data[0] : {};
            this.$content.html(html);
            return this.index(0);
        },

        beforeMomentum: function () {
            this.touch.addMomentumOptions(this._startTop, this.y, this.minY, this.maxY, this.wrapperH, this.itemHeight);
        },

        momentum: function (a) {
            this.y = a.current;
            this.$scroller.css({ '-webkit-transform': 'translate(' + (-this.x) + 'px,' + (-this.y) + 'px) translateZ(0)' });
        },

        stop: function () {
            this.index(Math.round(this.y / this.itemHeight));
        },

        itemHeight: 30,
        minDelta: 0,

        _index: 0,
        index: function (index) {
            if (typeof index === 'undefined') return this._index;

            if (index >= this.data.length) {
                index = this.data.length - 1;
            }

            if (index != -1 && this._index != index) {
                this.selectedData = this.data[index];
                this.trigger('Change', index, this.selectedData);
                this._index = index;

                var y = index * this.itemHeight;
                y != this.y && this.scrollTo(0, y, 200);
            }
            return this;
        },

        val: function (val) {
            if (typeof val === 'undefined')
                return this.selectedData.value;

            var index = util.indexOf(this.data, function (item) {
                return item.value == val;
            });

            this.index(index);
        }

    });

    var Selector = function (options) {
        options = $.extend({
            complete: function () { },
            options: []
        }, options);

        var that = this;
        var $container = $('<div style="position:fixed;top:0px;bottom:0px;left:0px;right:0px;width:100%;background: rgba(0,0,0,0);z-index:1000;display:none;overflow:hidden;"></div>').on('touchmove', false).appendTo('body');
        this.$container = $container;

        this.$mask = $('<div style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background: rgba(0,0,0,.3);z-index:999;display:none"></div>').appendTo('body');
        this.$el = $('<div class="selectorwrap" style="display:none"><div class="selectorbar"><b class="js_click">完成</b></div><div class="selector"></div></div>').appendTo($container);
        this.$selector = this.$el.find('.selector');
        this.selectors = [];

        $container.on('tap', function (e) {
            if (e.target === $container[0])
                that.hide();
        });

        if (!$.isArray(options.options)) {
            options.options = [options.options];
        }

        $.each(options.options, function (i, item) {
            that.add(item);
        });

        this.$el.on($.fx.transitionEnd, function () {

            that._visible = that.$el.hasClass('show');
            if (!that._visible) {
                that.$el.hide();
                that.$container.hide();
            } else {
                that.each(function () {
                    this.scrollTo(0, this._index * this.itemHeight);
                });
            }
        });

        this.$click = this.$el.find('.js_click').on('tap', function () {
            var result = [];
            $.each(that.selectors, function (i, sel) {
                result.push(sel.selectedData);
            });

            options.complete && options.complete.call(that, result);
            that.hide();
        });
    };

    Selector.prototype = {
        _visible: false,
        eq: function (i) {
            return this.selectors[i];
        },
        each: function (fn) {
            $.each(this.selectors, fn);
        },
        add: function (options) {
            var sel = new SelectorItem(options);
            this.selectors.push(sel);
            this.$selector.append(sel.$el);
        },
        hide: function () {
            var that = this;

            if (this._visible) {
                that.$mask.animate({
                    backgroundColor: 'rgba(0,0,0,0)'
                }, 350, function () {
                    that.$mask.hide().css({ backgroundColor: 'rgba(0,0,0,.3)' });
                });

                this.$el.removeClass('show');
            }

            return that;
        },
        show: function () {
            var that = this;

            if (!that._visible) {
                var $scroll = that.$selector.find('.scroller_container').css({ color: "#fff" });
                that.$container.show();
                that.$mask.show();
                that.$el.show();
                $scroll[0].clientHeight;

                that.$el.addClass('show');

                $scroll.animate({ color: "#333" }, 100, 'ease-out');
            }

            return that;
        },
        destory: function () {
            this.$el.off($.fx.transitionEnd);
            this.$click.off('click').off('tap');
            this.$mask.remove();
            this.$container.off('tap').remove();
        }
    };

    return Selector;
});
