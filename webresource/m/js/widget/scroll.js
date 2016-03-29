var $ = require('$'),
    util = require('util'),
    animation = require('../core/animation'),
    ScrollView = require('./scrollview2');

var _start = function(e) {
    var self = this;

    if (!self.scrollView && self.parentNode.scrollTop != 0) {
        self.isStop = true;
    } else {
        var point = e.touches[0],
            matrix = self.$.matrix();

        self.isStart = false;
        self.isStop = false;
        self.isMoved = false;
        self.sy = self.oy = self.pointY = point.pageY;
        self.sx = point.pageX;
        self.st = matrix[5];
        self.isLoading = self.isDataLoading;
    }
}

var _move = function(e) {
    var self = this;

    if (self.isStop) return;

    var point = e.touches[0],
        deltaY = point.pageY - self.sy,
        deltaX = point.pageX - self.sx;

    self.oy = self.pointY;
    self.pointY = point.pageY;

    if (!self.isStart) {
        self.isStart = true;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            self.isStop = true;
            return;
        }
    }

    var scrollView = self.scrollView;

    if ((scrollView ? scrollView.y <= 0 : self.parentNode.scrollTop == 0) && deltaY > 0) {

        self.isMoved = true;
        self.refreshAgain = true;
        self.ty = self.st + deltaY * .5;

        self.$.css({ '-webkit-transform': 'translate(0px,' + self.ty + 'px) translateZ(0)' });

        if (!this.isLoading) {
            self.$refresh.html(self.ty > 70 ? '释放刷新' : '下拉刷新');
        }
    } else {
        self.isStop = true;
    }
    return self.isStop;
}

var _end = function(e) {
    var self = this;

    if (self.isMoved) {
        var point = e.changedTouches[0],
            from = self.ty,
            end = from > 70 ? 50 : 0,
            ty,
            dy = self.oy - point.pageY,
            bounce = function() {

                self.$.animate({
                    '-webkit-transform': 'translate(0px,' + end + 'px) translateZ(0)'

                }, 300 + dy * -1, 'cubic-bezier(.3,.78,.43,.95)', function() {
                    self.refreshAgain = false;
                    if (!self.isLoading && end != 0) {
                        self.isLoading = self.isDataLoading = true;
                        self.$refresh.html('<div class="dataloading"></div>');
                        self.$.triggerHandler('refresh');
                    }
                });
            };

        self.isMoved = false;

        if (self.isLoading && !self.isDataLoading) {
            end = 0;
        }

        if (dy < -5) {
            self.$.animate({
                '-webkit-transform': 'translate(0px,' + (from - dy * 1.5) + 'px) translateZ(0)'

            }, dy * -1.5, 'cubic-bezier(.3,.78,.43,.95)', bounce);
        }
        else bounce();


        return false;
    }
}

var _refresh = function() {
    var self = this,
        complete = function() {
            self.$refresh.html('下拉刷新');
            self.isDataLoading = false;
            if (self.refreshAgain) return;

            var from = self.$.matrix()[5],
                end = Math.max(from - 50, 0);

            self.$.animate({
                '-webkit-transform': 'translate(0px,' + end + 'px) translateZ(0)'
            }, 400, 'cubic-bezier(.3,.78,.43,.95)');
        };

    self.options.refresh.call(this, complete, function(error) {
        sl.tip(typeof error == 'string' ? error : error.msg);
        complete();
    });
};

var touchStart = function(e) {
    var el = this,
        point = e.touches[0],
        now = +new Date;

    el.__sy = el.__pointY = point.pageY;
    el.__sx = point.pageX;
    el.__hasMomentum = false;
    el.__isMoved = false;
    el.__isStart = false;
    el.__isStop = false;
    el.__isScroll = false;
    el.__isHoldScroll = now - el.__timestamp <= 32;
};

var touchMove = function(e) {
    if (this.__isStop) return;

    var el = this,
        point = e.touches[0],
        pointY = point.pageY,
        deltaY = point.pageY - el.__sy,
        deltaX = point.pageX - el.__sx;

    el.__lastPY = el.__pointY;
    el.__pointY = pointY;

    if (!el.__isStart) {
        el.__isStart = true;
        if ((el.options.vScroll && !el.options.hScroll && Math.abs(deltaX) > Math.abs(deltaY)) || (!el.options.vScroll && el.options.hScroll && Math.abs(deltaX) < Math.abs(deltaY))) {
            el.__isStop = true;
            return;
        } else {
            el.__isStop = false;
        }
    }

    el.__isMoved = true;
    el.__isScroll = true;

    if (util.ios && el.$refresh && el.scrollTop < 0) {
        el.isRefresh = el.scrollTop < -70;
    }

    e.stopPropagation();
    el.__timestamp = +new Date;
};

var scrollStop = function(el) {
    if (el._stm) clearTimeout(el._stm);
    el._stm = setTimeout(function() {

        el._stm = null;

        if (!el.__params || el.__params.x != el.scrollLeft || el.__params.y != el.scrollTop) {
            $(el).trigger('scrollStop', (el.__params = {
                x: el.scrollLeft,
                y: el.scrollTop,
                width: el.clientWidth,
                height: el.clientHeight,
                scrollHeight: el.scrollHeight,
                scrollWidth: el.scrollWidth
            }));
        }

    }, 80);
}

var scroll = function() {
    var el = this;

    el.__isScroll = true;
    el.__timestamp = +new Date;

    if (el.__hasMomentum || util.android) {
        scrollStop(el);
    }
};

var touchEnd = function(e) {
    var el = this,
        $el = $(el),
        pointY = e.changedTouches[0].pageY,
        dy = Math.abs(el.__lastPY - pointY);

    scrollStop(el);

    if (util.ios && dy < 5) {
        el.__isStop = false;
        el.__hasMomentum = false;

    } else {
        el.__hasMomentum = true;
    }

    e.cancelTap === undefined && (e.cancelTap = el.__isScroll || el.__isHoldScroll);
    if (el.__isScroll && !el.__isStop || el.__isHoldScroll) {
        e.stopPropagation();
        e.preventDefault();
    }
    el.__isScroll = false;

    if (el.isRefresh) {
        el.isRefresh = false;
        el.$refresh.html('<div class="dataloading"></div>');
        el.$scroller.css({ '-webkit-transform': 'translate(0px,50px) translateZ(0)' }).triggerHandler('refresh');
    }
};

exports.bind = function(selector, options) {
	/*//<--debug
	options={
	useScroll: true,
	refresh: function(resolve,reject) {
	setTimeout(function() {
	reject('出错啦');
	},1000);
	}
	}
	//debug-->*/

    options = $.extend({
        vScroll: true,
        hScroll: false

    }, options);

    var scrollViews = [];
    var result = {
        items: scrollViews,
        get: function(el) {
            return util.first(this.items, typeof el == 'string' ? function(item) {
                return item.$el.filter(el).length > 0;

            } : function(item) {
                return item.el == el;
            });
        },
        eq: function(i) {
            return this.items[i];
        },
        destory: function() {
            this.items.forEach(function(item) {
                item.destory();
            });
        }
    };

    (typeof selector === 'string' || selector.nodeType ? $(selector) : selector).each(function() {
        var el = this,
            $el = $(el).addClass('scrollview'),
            scrollView,
            ret;

        if (options && options.useScroll || util.android && parseFloat(util.osVersion <= 2.3)) {
            ret = scrollView = new ScrollView(this, options);
        }
        else {
            el.__timestamp = 0;

            if (util.ios) {
                $el.css({
                    '-webkit-overflow-scrolling': 'touch',
                    overflowY: options.vScroll ? 'scroll' : '',
                    overflowX: options.hScroll ? 'scroll' : ''
                })

            } else if (util.android) {
                $el.css({
                    overflowY: options.vScroll ? 'auto' : '',
                    overflowX: options.hScroll ? 'auto' : ''
                });
            }
            $el.on('scroll', scroll)
                .on('touchstart', touchStart)
                .on('touchmove', touchMove)
                .on('touchend', touchEnd);

            el._scrollTop = 0;
            el.options = options;

            ret = {
                el: el,
                $el: $el,
                destory: function() {
                    $el.off('touchstart', touchStart)
                        .off('touchmove', touchMove)
                        .off('touchend', touchEnd)
                        .off('scroll', scroll);
                },
                scrollTo: function(x, y) {
                    el._scrollLeft = el.scrollLeft = x;
                    el._scrollTop = el.scrollTop = y;
                }
            };
        }

        el.scroll = ret;

        ret.imageLazyLoad = function(options) {
            var images = $('img[data-src]:not([src])', this.$el);
            var scrollTop = options ? options.y : 0;
            var height = options ? options.height : this.$el.height();
            var top = scrollTop + height;

            if (height == 0) return;

            images.each(function() {
                var parent = this.offsetParent;
                var imgTop = this.offsetTop;
                while (parent && parent != el && parent != document.body) {
                    imgTop += parent.offsetTop;
                    parent = parent.offsetParent;
                }

                if (imgTop <= top) {
                    this.src = this.getAttribute('data-src');
                    this.removeAttribute('data-src');
                }
            });
        }

        $el.on('scrollStop', function(e, options) {
            ret.imageLazyLoad(options);
        });

        scrollViews.push(ret);

        if (util.isInApp)
            $el.on('focus', 'input:not(readonly),textarea:not(readonly)', function(e) {
                var node = e.currentTarget,
                    offsetTop = 0;
                do {
                    offsetTop += node.offsetTop;
                    node = node.offsetParent;
                }
                while (node && el != node && !$.contains(node, el));

                var y = offsetTop - (window.innerHeight / 4 - 60);

                if (scrollView) {
                    scrollView.scrollTo(scrollView.x, y)
                } else {
                    el._scrollTop = el.scrollTop = y;
                }
            });

        if (options && options.refresh) {

            var $scroller = $el.children('.scroller_container'),
                $refresh = $('<div class="refresh" style="height:50px;text-align:center;line-height:50px;">下拉刷新</div>');

            if (!$scroller.length) $scroller = ScrollView.addScroller($el);

            var scroller = $scroller[0];

            scroller.$refresh = $refresh;
            scroller.$ = $scroller;
            scroller.options = options;

            if (scrollView) scroller.scrollView = scrollView;

            $scroller.css({ marginTop: -50 })
                .prepend($refresh)
                .on('touchstart', _start)
                .on('touchmove', _move)
                .on('touchend', _end)
                .on('refresh', _refresh);

            this.$refresh = $refresh;
            this.$scroller = $scroller;
        }
    });

    return result;
};