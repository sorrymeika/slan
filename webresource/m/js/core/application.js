var $ = require('$');
var util = require('util');
var bridge = require('bridge');
var Base = require('./base');
var Component = require('./component');
var animation = require('./animation');
var LinkList = require('./linklist');
var Queue = require('./queue');
var Touch = require('./touch');

var Route = require('./route');

var Activity = require('./activity');
var Toast = require('../widget/toast');

var noop = util.noop;
var lastIndexOf = util.lastIndexOf;
var slice = Array.prototype.slice;
var getPath = util.getPath;

function getToggleAnimation(isForward, currentActivity, activity, toggleAnim) {
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
        el: currentActivity.$el,
        start: exitFrom,
        css: anim[type + 'ExitAnimationTo'],
        ease: ease
    }, {
        el: activity.$el,
        start: enterFrom,
        css: anim[type + 'EnterAnimationTo'],
        ease: ease
    }];
}

function adjustActivity(currentActivity, activity) {
    currentActivity.$el.siblings('.view:not([data-path="' + activity.path + '"])').hide();
    if (activity.el.parentNode === null) activity.$el.appendTo(currentActivity.application.el);
}

function bindBackGesture(application) {

    var touch = application.touch = new Touch(application.el, {
        enableVertical: false,
        enableHorizontal: true,
        momentum: false
    });

    touch.on('beforestart', function (e) {
        this.x = 0;

        if (this._isInAnim || this.pointY < 80) {
            this.stop();
        }

    }).on('start', function () {
        var that = this,
            action,
            isForward,
            deltaX = that.deltaX;

        if (that.isDirectionY || that.swiperQueue || that.swiper) {
            if (that.swiperQueue) {
                that._stop();
            }
            that.stop();
            return;
        }
        that.width = window.innerWidth;
        that.minX = that.width * -1;
        that.maxX = 0;

        var currentActivity = application.activityManager.getCurrentActivity();
        var isSwipeLeft = that.isSwipeLeft = deltaX > 0;

        that.swiper = null;

        action = isSwipeLeft ? (currentActivity.swipeLeftForwardAction ? (isForward = true, currentActivity.swipeLeftForwardAction) : (isForward = false, currentActivity.swipeLeftBackAction)) :
            (currentActivity.swipeRightForwardAction ? (isForward = true, currentActivity.swipeRightForwardAction) : (isForward = false, currentActivity.swipeRightBackAction));

        if (!action) {
            if (isSwipeLeft && currentActivity.referrerDir == "Left") {
                action = currentActivity.referrer;
            } else if (!isSwipeLeft && currentActivity.referrerDir != "Left") {
                action = currentActivity.referrer;
            }
            isForward = false;
        }

        if (action) {
            that.swiperQueue = new Queue(function (next) {

                application.mask.show();
                currentActivity._startExiting();

                application.activityManager.get(action, function (activity) {
                    that.needRemove = activity.el.parentNode === null;
                    adjustActivity(currentActivity, activity);

                    that.isSwipeOpen = isForward;

                    that.swiper = new animation.Animation(getToggleAnimation(isForward, currentActivity, activity));
                    that.swipeActivity = activity;

                    next();
                });
            });

        } else {
            that.swiperQueue = null;
        }

    }).on('move', function (e) {
        var that = this,
            deltaX = that.deltaX;

        if (!that.swiperQueue) return;

        that.swiperQueue.push(function () {
            that.swiper.step(that.isSwipeLeft && deltaX < 0 || !that.isSwipeLeft && deltaX > 0 ?
                0 :
                (Math.abs(deltaX) * 100 / that.width));
        });

    }).on('stop', function () {

        this.isCancelSwipe = this.isMoveLeft !== this.isSwipeLeft || Math.abs(this.deltaX) <= 10;

        var currentActivity = application.activityManager.getCurrentActivity()

        if (!this.isCancelSwipe)
            currentActivity.trigger('Pause');

        if (this.swiperQueue) {
            var that = this;

            that.swiperQueue.push(function () {

                that._isInAnim = true;

                application.queue.push(function (err, res, next) {

                    that.swiper.animate(200, that.isCancelSwipe ? 0 : 100, function () {
                        var activity = that.swipeActivity;

                        that._isInAnim = false;

                        if (that.isCancelSwipe) {
                            currentActivity.isPrepareExitAnimation = false;
                            currentActivity.$el.addClass('active');
                            that.needRemove && activity.$el.remove();
                            application.mask.hide();

                        } else {
                            activity.isForward = that.isSwipeOpen;

                            application.activityManager.setCurrentActivity(activity);
                            application.navigate(activity.url, that.isSwipeOpen);

                            currentActivity.trigger('Hide');
                            activity._enterAnimationEnd();

                            if (that.isSwipeOpen) {
                                activity.referrer = currentActivity.url;
                                activity.referrerDir = that.isSwipeLeft ? "Right" : "Left";
                            } else {
                                currentActivity.destroy();
                            }
                        }

                        next();
                    });

                    return this;
                });

                that.swiperQueue = null;
                that.swiper = null;
            });
        }
    });
}


var Application = Component.extend({

    events: {
        'tap,click a[href]:not(.js-link-default)': function (e) {
            var target = $(e.currentTarget);
            var href = target.attr('href');

            if (!/^(http\:|https\:|javascript\:|mailto\:|tel\:|[a-zA-Z0-9]+\:\/\/)/.test(href)) {
                if (e.type == 'tap') {
                    if (!/^#/.test(href)) href = '#' + href;

                    target.attr('back') != null ? this.back(href) : this.forward(href);
                }

            } else if (sl.isInApp && href.indexOf('http') == 0) {
                bridge.openInApp(href);

            } else if (sl.isInApp && !/^(javascript\:|mailto\:|tel\:)/.test(href)) {
                bridge.open(href);

            } else {
                target.addClass('js-link-default');
                return;
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

    initialize: function (options) {
        //var preventEvents = 'tap click touchmove touchstart';

        this.routeManager = options.routeManager;

        this.activityManager = options.activityManager;
        this.activityManager.application = this;

        this.el = this.$el[0];
        this.mask = this.$el.children('.screen'); //.off(preventEvents).on(preventEvents, false);

        this.history = [];
        this._backAction = [];

        if (options.backGesture !== false) bindBackGesture(this);

        var readyForExit = false;
        var that = this;

        $(window).on('back', function () {

            if (that._backAction.length) {
                that._backAction.pop()();
                return;
            }

            var hash = location.hash;
            var currentActivity = that.getCurrentActivity();

            if (!currentActivity || currentActivity.path == "/" || currentActivity.path == options.loginPath) {
                if (readyForExit) {
                    bridge.exit();
                } else {
                    readyForExit = true;
                    setTimeout(function () {
                        readyForExit = false;
                    }, 2000);
                    Toast.showToast("再按一次退出程序");
                }

            } else {
                that.back(currentActivity.referrer || '/');
            }

        }).on('urlchange', function (e, data) {
            that.forward(data.url);

        }).on('keyboardWillShow', function (e, keyboardHeight) {
            that.el.style.bottom = keyboardHeight + 'px';

        }).on('keyboardWillHide', function () {
            that.el.style.bottom = '0px';

        });
    },

    addBackAction: function (fn) {
        this._backAction.push(fn);
    },

    removeBackAction: function (fn) {

        if (fn === undefined) {
            this._backAction.length = 0;
            return;
        }

        for (var i = this._backAction.length; i >= 0; i--) {
            if (this._backAction[i] === fn) {
                this._backAction.splice(i, 1);
                break;
            }
        }
    },

    getCurrentActivity: function () {
        return this.activityManager.getCurrentActivity();
    },

    start: function (delay) {
        var that = this;
        var $win = $(window);
        var $el = this.$el;

        this.$el = $(that.el);

        if (bridge.hasStatusBar) {
            $('body').addClass('has_status_bar');
        }

        this.hash = Route.formatUrl(location.hash);

        this.historyQueue = Queue.done();

        var delayPromise;

        if (delay) {

            delayPromise = new Promise(function (resolve) {

                setTimeout(function () {
                    $el.appendTo(document.body);

                    resolve();

                }, delay);
            });

        } else {
            $el.appendTo(document.body);
        }

        this.queue = new Queue();

        this.activityManager.get(this.hash, function (activity) {

            that.history.push(that.hash);

            activity.$el.appendTo(that.el);

            that.activityManager.setCurrentActivity(activity);

            activity.$el.transform(require('anim/' + activity.toggleAnim).openEnterAnimationTo);

            (delayPromise || Promise.resolve()).then(function () {

                activity.doAfterCreate(function () {
                    activity.$el.css({
                        opacity: 0
                    }).addClass('active').animate({
                        opacity: 1

                    }, 'ease-out', 400);

                    activity.trigger('Appear').trigger('Show');

                    that.trigger('Start');

                    that.queue.shift();
                });
            });

            $win.on('hashchange', function () {
                var hash = that.hash = Route.formatUrl(location.hash);
                var hashIndex;

                if (that.hashChanged) {
                    that.hashChanged = false;
                    that.historyQueue.shift();

                } else {
                    that.historyQueue.push(function () {

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

        $win.one('load', function () {
            if (!location.hash) location.hash = '/';
        });

        return this;
    },

    _toggle: function (route, options, toggleFinish, queueDone) {

        var activityManager = this.activityManager;
        var currentActivity = activityManager.getCurrentActivity();

        var url = route.url;

        if (currentActivity.path == route.path) {
            this.navigate(url, 2);
            activityManager.checkQueryString(currentActivity, route);
            queueDone();
            return;
        }

        var isForward = options.isForward;
        var duration = options.duration === undefined ? 400 : options.duration;
        var prevActivity;
        var that = this;

        this.navigate(url, isForward);

        route.isForward = isForward;

        if (isForward === 2) {
            prevActivity = currentActivity.route.prevActivity;
            route.prevActivity = prevActivity;
            route.referrer = prevActivity ? prevActivity.url : null;
            route.referrerDir = "Left";

        } else if (isForward) {
            route.prevActivity = currentActivity;
            route.referrer = currentActivity.url;
            route.referrerDir = currentActivity.swipeRightForwardAction == url ? "Left" : "Right";
        }

        currentActivity._startExiting();

        activityManager.get(route, function (activity) {

            adjustActivity(currentActivity, activity);

            activityManager.setCurrentActivity(activity)
                .checkQueryString(activity, route);

            currentActivity.trigger('Pause');

            activity.trigger('Appear');

            var ease = 'cubic-bezier(.34,.86,.54,.99)';
            var anims = getToggleAnimation(isForward, currentActivity, activity, options.toggleAnim);
            var anim;
            var executedFinish = false;
            var finish = function () {
                if (executedFinish) return;
                executedFinish = true;

                currentActivity.trigger('Hide');
                activity._enterAnimationEnd();
                toggleFinish && toggleFinish.call(that, activity);
                queueDone();
            };

            for (var i = 0, n = anims.length; i < n; i++) {
                anim = anims[i];

                if (!duration) {
                    anim.el.css(animation.transform(anim.css).css);

                } else {
                    anim.ease = ease;
                    anim.duration = duration;

                    anim.el.css(animation.transform(anim.start).css)
                        .animate(animation.transform(anim.css).css, duration, ease, finish);
                }
            }
            currentActivity.$el.addClass('active');

            if (!duration) {
                finish();
            }

            //setTimeout(finish, duration + 300);

            //anim.finish = finish;
            //animation.parallel(anims);
        });
    },

    /**
     * 改变当前hash但不触发viewchange
     * 
     * @param {String} url 地址
     * @param {boolean|number} [isForward] 前进、后退状态
     * 
     * @example
     * // location.replace方式
     * application.navigate(url, 2);
     * 
     * // location.hash = url;
     * application.navigate(url, true);
     * 
     * // history.go(-n)
     * application.navigate(url, false);
     */
    navigate: function (url, isForward) {

        this.historyQueue.push(function () {
            var index,
                hashChanged = !Route.compareUrl(url, location.hash);

            this.hashChanged = hashChanged;

            if (isForward === 2) {
                this.history[this.history.length - 1] = url;
                hashChanged && (location.replace('#' + url));

            } else if (isForward) {

                this.history.push(url);
                hashChanged && (location.hash = url);

            } else {
                index = lastIndexOf(this.history, url);

                if (index == -1) {
                    this.history.length = 0;
                    this.history.push(url);
                    hashChanged && (location.replace('#' + url));

                } else {
                    var go = index + 1 - this.history.length;

                    hashChanged && go && setTimeout(function () {
                        history.go(go);
                    }, 0);
                    this.history.length = index + 1;
                }
            }

            return hashChanged ? this.historyQueue : null;

        }, this);

    },

    _navigate: function (url, isForward, duration, toggleAnim, data) {
        var route = this.routeManager.match(url);

        if (route) {

            this.queue.push(function (err, res, next) {
                var options = {};

                if (typeof duration == "string") data = toggleAnim, toggleAnim = duration, duration = 400;
                else if (typeof duration == "object") data = duration, toggleAnim = null, duration = 400;

                var currentActivity = this.activityManager.getCurrentActivity();

                if (data) {
                    Object.assign(route.data, data);
                }

                options.isForward = isForward;

                duration !== null && (options.duration = duration);
                toggleAnim !== null && (options.toggleAnim = toggleAnim);

                this._toggle(route, options, isForward && isForward != 2 ? null : function () {
                    currentActivity.destroy();

                }, next);

                return this.queue;
            }, this);

        } else {
            location.hash = this.activityManager.getCurrentActivity().url;
        }
    },

    /**
     * 前进动画条转到指定页面
     * [url, [[duration], [toggleAnim], [data]]]
     */
    forward: function (url, duration, toggleAnim, data) {
        this._navigate(url, true, duration, toggleAnim, data);
    },

    back: function (url, duration, toggleAnim, data) {
        this._navigate(url, false, duration, toggleAnim, data);
    },

    replace: function (url, duration) {
        this._navigate(url, 2, duration || 0);
    }
});


module.exports = Application;