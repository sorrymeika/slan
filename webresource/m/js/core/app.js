var $ = require('$');
var util = require('util');
var bridge = require('bridge');
var Base = require('./base');
var Component = require('./component');
var appProto = require('./appProto');
var animation = require('./animation');
var LinkList = require('./linklist');
var Async = require('./async');
var Touch = require('./touch');
var Route = require('./route');
var Activity = require('./activity');

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

function adjustActivity(currentActivity, activity) {
    currentActivity._startExit();
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

        if (this._isInAnim) {
            this.stop();
        }

    }).on('start', function () {
        var that = this,
            action,
            isForward,
            deltaX = that.deltaX;

        if (that.isDirectionY || that.swiperAsync || that.swiper) {
            if (that.swiperAsync) {
                that._stop();
            }
            that.stop();
            return;
        }
        that.width = window.innerWidth;
        that.minX = that.width * -1;
        that.maxX = 0;

        var currentActivity = application._currentActivity;
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
            that.swiperAsync = new Async(function (done) {

                application.mask.show();
                application.get(action, function (activity) {
                    that.needRemove = activity.el.parentNode === null;
                    adjustActivity(currentActivity, activity);

                    that.isSwipeOpen = isForward;

                    that.swiper = new animation.Animation(getToggleAnimation(isForward, currentActivity, activity));
                    that.swipeActivity = activity;

                    done();
                });
            });

        } else {
            that.swiperAsync = null;
        }

    }).on('move', function (e) {
        var that = this,
            deltaX = that.deltaX;

        if (!that.swiperAsync) return;

        that.swiperAsync.await(function () {
            that.swiper.step(that.isSwipeLeft && deltaX < 0 || !that.isSwipeLeft && deltaX > 0 ?
                0 :
                (Math.abs(deltaX) * 100 / that.width));
        });

    }).on('stop', function () {
        var that = this;

        that.isCancelSwipe = that.isMoveLeft !== that.isSwipeLeft || Math.abs(that.deltaX) <= 10;

        if (!that.isCancelSwipe)
            application._currentActivity.trigger('Pause');

        if (that.swiperAsync) {
            that.swiperAsync.await(function () {

                that._isInAnim = true;

                application.queue.await(function (err, res, done) {

                    that.swiper.animate(200, that.isCancelSwipe ? 0 : 100, function () {
                        var activity = that.swipeActivity,
                            currentActivity = application._currentActivity;

                        that._isInAnim = false;

                        if (that.isCancelSwipe) {
                            currentActivity.isPrepareExitAnimation = false;
                            currentActivity.$el.addClass('active');
                            that.needRemove && activity.$el.remove();
                            application.mask.hide();

                        } else {
                            activity.isForward = that.isSwipeOpen;

                            application._currentActivity = that.swipeActivity;
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

                        done();
                    });

                    return this;
                });

                that.swiperAsync = null;
                that.swiper = null;
            });
        }
    });
}

var Application = Component.extend(Object.assign(appProto, {
    events: {
        'tap,click a[href]:not(.js-link-default)': function (e) {
            var that = this;
            var target = $(e.currentTarget);
            var href = target.attr('href');

            if (!/^(http\:|https\:|javascript\:|mailto\:|tel\:)/.test(href)) {
                if (e.type == 'tap') {
                    if (!/^#/.test(href)) href = '#' + href;

                    target.attr('back') != null ? that.back(href) : that.forward(href);
                }

            } else if (sl.isInApp && href.indexOf('http') == 0) {
                bridge.openInApp(href);

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

    backGesture: true,

    initialize: function () {
        var that = this;
        //var preventEvents = 'tap click touchmove touchstart';

        that.el = that.$el[0];
        that.mask = that.$el.children('.screen'); //.off(preventEvents).on(preventEvents, false);

        that.history = [];

        if (that.backGesture) bindBackGesture(this);

        var prepareExit = false;

        $(window).on('back', function () {

            var hash = location.hash;
            if (!that._currentActivity || that._currentActivity.path == "/") {
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
                that.back(that._currentActivity.referrer || '/');
            }
        });
    },

    getCurrentActivity: function () {
        return this._currentActivity;
    },

    start: function (delay) {
        var that = this;
        var $win = $(window);
        var $el = that.$el;

        window.Application = this;

        that.queue = new Async();

        that.$el = $(that.el);

        if (bridge.hasStatusBar) {
            $('body').addClass('has_status_bar');
        }

        that.hash = Route.formatUrl(location.hash);

        that.historyAsync = Async.done();

        if (delay) {
            setTimeout(function () {
                $el.appendTo(document.body);

                delay.doneSelf();

            }, delay);

            delay = new Async();

        } else {
            $el.appendTo(document.body);
        }

        that.get(that.hash, function (activity) {

            that.history.push(that.hash);

            activity.$el.appendTo(that.el);
            that._currentActivity = activity;

            activity.$el.transform(require('anim/' + activity.toggleAnim).openEnterAnimationTo);

            activity.then(delay)
                .then(function (err, res, done) {
                    activity.$el.addClass('active');
                    activity.trigger('Appear').trigger('Show');

                    that.trigger('Start');

                    done();

                    that.queue.doneSelf();
                });

            $win.on('hashchange', function () {
                var hash = that.hash = Route.formatUrl(location.hash);
                var hashIndex;

                if (that.hashChanged) {
                    that.hashChanged = false;
                    that.historyAsync.doneSelf();

                } else {
                    that.historyAsync.then(function () {

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
    },

    _toggle: function (route, options, toggleFinish, queueDone) {

        var that = this,
            currentActivity = that._currentActivity,
            url = route.url,
            isForward = options.isForward,
            duration = options.duration === undefined ? 400 : options.duration;

        that.navigate(url, isForward);

        if (currentActivity.path == route.path) {
            that.checkQueryString(currentActivity, route);
            queueDone();
            return;
        }

        route.isForward = isForward;

        if (isForward) {
            route.prevActivity = currentActivity;
            route.referrer = currentActivity.url;
            route.referrerDir = currentActivity.swipeRightForwardAction == url ? "Left" : "Right";
        }

        that.get(route, function (activity) {
            that._currentActivity = activity;

            adjustActivity(currentActivity, activity);

            that.checkQueryString(activity, route);
            activity.then(function () {
                activity.trigger('Appear');
            });

            currentActivity.trigger('Pause');

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

            if (!duration) {
                finish();
            }

            //setTimeout(finish, duration + 300);

            //anim.finish = finish;
            //animation.parallel(anims);
        });
    },

    //改变当前hash但不触发viewchange
    navigate: function (url, isForward) {
        var that = this;

        that.historyAsync.then(function () {
            var index,
                hashChanged = !Route.compareUrl(url, location.hash);

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

                    hashChanged && go && setTimeout(function () {
                        history.go(go);
                    }, 0);
                    that.history.length = index + 1;
                }
            }
            return hashChanged ? this : null;
        });

    },

    _navigate: function (url, isForward, duration, toggleAnim, data) {
        var self = this;
        var route = this.route.match(url);

        if (route) {
            var queue = this.queue;

            console.log(queue);

            queue.await(function (err, res, queueDone) {
                var options = {};

                if (typeof duration == "string") data = toggleAnim, toggleAnim = duration, duration = 400;
                else if (typeof duration == "object") data = duration, toggleAnim = null, duration = 400;

                var currentActivity = self._currentActivity;

                if (data) {
                    Object.assign(route.data, data);
                }

                options.isForward = isForward;

                duration !== null && (options.duration = duration);
                toggleAnim !== null && (options.toggleAnim = toggleAnim);

                self._toggle(route, options, isForward ? null : function () {
                    currentActivity.destroy();
                }, queueDone);

                return this;
            });

        } else {
            location.hash = this._currentActivity.url;
        }
    },

    //@arguments=[url,[[duration],[toggleAnim],[data]]]
    forward: function (url, duration, toggleAnim, data) {
        this._navigate(url, true, duration, toggleAnim, data);
    },

    back: function (url, duration, toggleAnim, data) {
        this._navigate(url, false, duration, toggleAnim, data);
    },

    createIFrame: function ($container) {
        var $iframe = $('<iframe width="' + window.innerWidth + 'px" frameborder="0" />').appendTo($container);
        var iframeWin = $iframe[0].contentWindow;
        var iframeDoc = iframeWin.document;
        var self = this;

        $(iframeDoc.body).on('click', 'a[href]', function (e) {
            var target = $(e.currentTarget);
            var href = target.attr('href');

            if (!/^(http\:|https\:|javascript\:|mailto\:|tel\:)/.test(href)) {
                e.preventDefault();
                if (!/^#/.test(href)) href = '#' + href;

                target.attr('back') != null ? self.back(href) : self.forward(href);

            } else if (sl.isInApp && href.indexOf('http') == 0) {
                bridge.openInApp(href);
            }
            return false;
        });

        return {
            $el: $iframe,
            window: iframeWin,
            document: iframeDoc,
            html: function (content) {

                iframeDoc.body.innerHTML = '<style>p{ padding:0;margin:0 0 10px 0; }img{width:100%;height:auto;display:block;}</style>' + content;

                $iframe.css({ height: iframeDoc.documentElement.scrollHeight });

                [].forEach.call(iframeDoc.querySelectorAll('img'), function (img) {
                    img.style.width = "100%";
                    img.style.height = "auto";
                    img.onload = function () {
                        $iframe.css({ height: iframeDoc.documentElement.scrollHeight });
                    }
                })
            }
        }
    }
}));

module.exports = Application;