define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        bridge = require('bridge'),
        Base = require('./base'),
        View = require('./view'),
        Master = require('./master'),
        animation = require('./animation'),
        LinkList = require('./linklist'),
        Promise = require('./promise'),
        Touch = require('./touch'),
        Route = require('./route'),
        Activity = require('./activity');

    var noop = util.noop,
        lastIndexOf = util.lastIndexOf,
        slice = Array.prototype.slice,
        getPath = util.getPath,
        standardizeHash = Route.standardizeHash;

    var getToggleAnimation = function (isForward, currentActivity, activity, toggleAnim) {
        if (!toggleAnim) toggleAnim = (isForward ? activity : currentActivity).toggleAnim;

        var anim = require('anim/' + toggleAnim),
            type = isForward ? "open" : "close",
            ease = isForward ? 'ease-out' : 'ease-out',
            enterFrom = $.extend({}, anim[type + 'EnterAnimationFrom']),
            exitFrom = $.extend({}, anim[type + 'ExitAnimationFrom']);

        enterFrom.zIndex = isForward ? anim.openEnterZIndex : anim.closeEnterZIndex;
        enterFrom.display = 'block';
        exitFrom.zIndex = isForward ? anim.openExitZIndex : anim.closeExitZIndex;

        return [{
            el: activity.$el,
            start: enterFrom,
            css: anim[type + 'EnterAnimationTo'],
            ease: ease
        }, {
                el: currentActivity.$el,
                start: exitFrom,
                css: anim[type + 'ExitAnimationTo'],
                ease: ease
            }];
    }

    var adjustActivity = function (currentActivity, activity) {
        currentActivity.startExit();
        currentActivity.$el.siblings('.view:not([data-path="' + activity.path + '"])').hide();
        if (activity.el.parentNode === null) activity.$el.appendTo(currentActivity.application.el);
    };

    var bindBackGesture = function (application) {
        application.touch = new Touch(application.el, {
            start: function () {
                var that = this,
                    action,
                    isForward,
                    deltaX = that.touch.dx;

                if (that.touch.isDirectionY || that.swiperPromise || that.swiper) {
                    if (that.swiperPromise) {
                        that.touch.options.stop.call(that);
                    }
                    that.touch.stop();
                    return;
                }
                that.width = window.innerWidth;

                var currentActivity = that._currentActivity;
                var isSwipeLeft = that.isSwipeLeft = deltaX > 0;

                that.swiper = null;

                action = isSwipeLeft ? (currentActivity.swipeLeftForwardAction ? (isForward = true, currentActivity.swipeLeftForwardAction) : (isForward = false, currentActivity.swipeLeftBackAction))
                    : (currentActivity.swipeRightForwardAction ? (isForward = true, currentActivity.swipeRightForwardAction) : (isForward = false, currentActivity.swipeRightBackAction));

                if (!action) {
                    if (isSwipeLeft && currentActivity.referrerDir == "Left") {
                        action = currentActivity.referrer;
                    } else if (!isSwipeLeft && currentActivity.referrerDir != "Left") {
                        action = currentActivity.referrer;
                    }
                    isForward = false;
                }

                if (action) {
                    that.swiperPromise = new Promise();

                    that.mask.show();
                    that.get(action, function (activity) {
                        that.needRemove = activity.el.parentNode === null;
                        adjustActivity(currentActivity, activity);

                        that.isSwipeOpen = isForward;

                        that.swiper = new animation.Animation(getToggleAnimation(isForward, currentActivity, activity));
                        that.swipeActivity = activity;

                        that.swiperPromise.resolve();
                    });

                } else {
                    that.swiperPromise = null;
                }
            },

            move: function (e) {
                var that = this,
                    deltaX = that.touch.dx;

                if (!that.swiperPromise) return;

                that.swiperPromise.then(function () {
                    that.swiper.step(that.isSwipeLeft && deltaX < 0 || !that.isSwipeLeft && deltaX > 0 ?
                        0 :
                        (Math.abs(deltaX) * 100 / that.width));
                });
            },

            stop: function () {
                var that = this;

                that.isCancelSwipe = that.touch.isMoveLeft !== that.isSwipeLeft || Math.abs(that.touch.dx) <= 10;

                if (that.swiperPromise) {
                    that.swiperPromise.then(function () {

                        that.queue.then([200, that.isCancelSwipe ? 0 : 100, function () {
                            var activity = that.swipeActivity,
                                currentActivity = that._currentActivity;

                            if (that.isCancelSwipe) {
                                currentActivity.isPrepareExitAnimation = false;
                                currentActivity.$el.addClass('active');
                                that.needRemove && activity.$el.remove();
                                that.mask.hide();
                                
                            } else {
                                activity.isForward = that.isSwipeOpen;

                                that._currentActivity = that.swipeActivity;
                                that.navigate(activity.url, that.isSwipeOpen);

                                activity.finishEnterAnimation();

                                if (that.isSwipeOpen) {
                                    activity.referrer = currentActivity.url;
                                    activity.referrerDir = that.isSwipeLeft ? "Right" : "Left";
                                    currentActivity.trigger('Pause');
                                } else {
                                    currentActivity.destroy();
                                }
                            }
                            that.queue.resolve();

                        }], that.swiper.animate, that.swiper);

                        that.swiperPromise = null;
                        that.swiper = null;
                    });


                }
            }
        }, application);
    };

    var Application = View.extend($.extend(Master, {
        events: {
            'tap,click a[href]:not(.js-link-default)': function (e) {
                var that = this,
                    target = $(e.currentTarget);
                var href = target.attr('href');

                if (!/^(http\:|https\:|javascript\:|mailto\:|tel\:)/.test(href)) {
                    e.preventDefault();
                    if (e.type == 'tap') {
                        if (!/^#/.test(href)) href = '#' + href;

                        target.attr('back') != null ? that.back(href) : that.forward(href);
                    }

                } else if (sl.isInApp && href.indexOf('http') == 0) {
                    bridge.openInApp(href);

                } else {
                    target.addClass('js-link-default');
                }

                return false;
            },
            'tap [data-back]': function (e) {
                this.back($(e.currentTarget).attr('data-back'));
            },
            'tap [data-forward]': function (e) {
                this.forward($(e.currentTarget).attr('data-forward'));
            },
            'focus input': function (e) {
                this.activeInput = e.target;
            }
        },

        el: '<div class="viewport"><div class="screen" style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background:rgba(0,0,0,0);z-index:20000;display:none"></div></div>',

        backGesture: true,

        initialize: function () {
            var that = this;
            //var preventEvents = 'tap click touchmove touchstart';

            that.el = that.$el[0];
            that.mask = that.$el.children('.screen');//.off(preventEvents).on(preventEvents, false);
            //that.canvas = that.$el[2];
            //that.$input = that.$el[3];

            that.history = [];

            if (that.backGesture) bindBackGesture(this);

            var prepareExit = false;

            $(window).on('back', function () {

                var hash = location.hash;
                if (hash == '' || hash === '#' || hash === "/" || hash === "#/") {
                    if (prepareExit) {
                        bridge.exit();
                    } else {
                        prepareExit = true;
                        setTimeout(function () {
                            prepareExit = false;
                        }, 2000);
                        sl.tip("再按一次退出程序");
                    }

                } else {
                    that.back(that.history[that.history.length - 2]);
                }
            });
        },

        start: function (delay) {
            var that = this;
            var $win = $(window);
            var hash = location.hash || '/';
            var $el = that.$el;

            that.queue = new Promise();

            if (delay) {
                setTimeout(function () {
                    $el.appendTo(document.body);
                    delay.resolve();
                }, delay);

                delay = new Promise();
            } else {
                $el.appendTo(document.body);
            }

            that.$el = $(that.el);

            if (bridge.hasStatusBar) {
                that.$el.addClass('has_status_bar');
            }

            that.hash = hash = standardizeHash(hash);

            that.historyPromise = new Promise().resolve();

            that.get(hash, function (activity) {

                that.history.push(hash);

                activity.$el.appendTo(that.el);
                that._currentActivity = activity;

                activity.$el.transform(require('anim/' + activity.toggleAnim).openEnterAnimationTo);
                activity.then(delay).then(function () {
                    activity.$el.addClass('active');
                    activity.trigger('Appear').trigger('Show');

                    that.trigger('start');
                    that.queue.resolve();
                });

                $win.on('hashchange', function () {
                    var hash = that.hash = standardizeHash(location.hash);
                    var hashIndex;

                    if (that.hashChanged) {
                        that.hashChanged = false;
                        that.historyPromise.resolve();

                    } else {
                        that.historyPromise.then(function () {

                            hashIndex = lastIndexOf(that.history, hash);
                            if (hashIndex == -1) {
                                that.forward(hash);
                            } else {
                                that.back(hash);
                            }
                        });
                    }
                });
            });

            $win.one('load', function () { if (!location.hash) location.hash = '/'; });
        },

        _toggle: function (route, options, callback) {

            var that = this,
                currentActivity = that._currentActivity,
                url = route.url,
                isForward = options.isForward,
                duration = options.duration || 400;

            that.navigate(url, isForward);

            if (currentActivity.path == route.path) {
                that.checkQueryString(currentActivity, route);
                that.queue.resolve();
                return;
            }

            route.referrer = currentActivity.url;

            that.get(route, function (activity) {
                that._currentActivity = activity;

                adjustActivity(currentActivity, activity);

                that.checkQueryString(activity, route);
                activity.then(function () {
                    activity.trigger('Appear');
                });

                var ease = 'cubic-bezier(.34,.86,.54,.99)',
                    anims = getToggleAnimation(isForward, currentActivity, activity, options.toggleAnim),
                    anim;
                    
                activity.isForward = isForward;

                if (isForward) {
                    activity.referrer = currentActivity.url;
                    activity.referrerDir = currentActivity.swipeRightForwardAction == url ? "Left" : "Right";
                }

                var finish = function () {
                    activity.finishEnterAnimation();
                    callback && callback(activity);
                    that.queue.resolve();
                };

                for (var i = 0, n = anims.length; i < n; i++) {
                    anim = anims[i];
                    anim.ease = ease;
                    anim.duration = duration;

                    anim.el.css(animation.transform(anim.start).css).animate(animation.transform(anim.css).css, duration, ease);
                }

                setTimeout(finish, duration + 48);

                //anim.finish = finish;
                //animation.parallel(anims);
            });
        },

        //改变当前hash但不触发viewchange
        navigate: function (url, isForward) {
            var that = this;

            that.historyPromise.then(function () {
                var index,
                    hashChanged = url !== standardizeHash(location.hash);

                that.hashChanged = hashChanged;

                if (isForward) {
                    that.history.push(url);
                    hashChanged && (location.hash = url);

                } else {
                    index = lastIndexOf(that.history, url);

                    if (index == -1) {
                        that.history.length = 0;
                        that.history.push(url);
                        hashChanged && (location.hash = url);

                    } else {
                        var go = index + 1 - that.history.length;
                        hashChanged && go && history.go(go);
                        that.history.length = index + 1;
                    }
                }
                return hashChanged ? this : null;
            });

        },

        forward: function (url, options) {

            var route = this.route.match(url);
            if (route) {
                this.queue.then(function () {
                    var currentActivity = this._currentActivity;
                    (options || (options = {})).isForward = true;

                    this._toggle(route, options, function () {
                        currentActivity.trigger('Pause');
                    });

                    return this.queue;
                }, this);
            }
        },

        back: function (url, options) {
            var route = this.route.match(url);
            if (route) {
                this.queue.then(function () {
                    var currentActivity = this._currentActivity;

                    (options || (options = {})).isForward = false;

                    this._toggle(route, options, function () {
                        currentActivity.destroy();
                    });

                    return this.queue;

                }, this);
            }
        }
    }));

    return Application;
});
