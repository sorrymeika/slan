
var util = require('util'),
    Event = require('./event'),
    Promise = require('promise'),
    Async = require('./async'),
    Scroll = require('widget/scroll'),
    Component = require('./component'),
    bridge = require('bridge'),
    slice = Array.prototype.slice,
    indexOf = util.indexOf,
    getUrlPath = util.getPath;

var Activity = Component.extend({
    el: '<div class="view"></div>',

    toggleAnim: 'def',
    defBackUrl: '/',
    autosetBackUrl: true,

    _setReferrer: function (route) {
        this.isForward = route.isForward;

        if (route.isForward) {
            var currActivity,
                prevRoute = route,
                prevActivity = this;

            while ((currActivity = prevRoute.prevActivity) && (prevActivity = currActivity.route.prevActivity) && prevRoute) {
                if (prevActivity == this) {
                    currActivity.route.prevActivity = this.route.prevActivity;
                    currActivity.referrer = currActivity.route.referrer = this.referrer;
                    currActivity.referrerDir = currActivity.route.referrerDir = this.referrerDir;
                    currActivity.swipeRightBackAction = this.swipeRightBackAction;
                    break;
                }
                prevRoute = prevActivity.route;
            }

            this.referrer = route.referrer;
            this.referrerDir = route.referrerDir;
        }

        if (this.autosetBackUrl) {
            backUrl = route.query.from || this.referrer || this.defBackUrl;

            getUrlPath(backUrl) != route.path.toLowerCase() && (this.swipeRightBackAction = backUrl);
        }
        return this;
    },

    _setRoute: function (route) {
        this._query = $.extend({}, this.query);

        this.route = route;
        this.hash = route.hash;
        this.url = route.url;
        this.path = route.path;
        this.query = route.query;

        return this;
    },

    initialize: function (options) {
        var self = this,
            async = Async.resolve();

        self._async = async;

        self.application = options.application;

        if (this.className) {
            this.className += ' view';
            this.$el.addClass('view');
        }

        self._setReferrer(options.route)
            ._setRoute(options.route)
            .on('Show', self._onShow)
            .on('Destroy', self._onDestroy)
            .on('Pause', self._statusChange)
            .on('QueryChange', self.checkQuery);

        self.onResume && self.on('Resume', self.onResume);
        self.onShow && self.on('Show', self.onShow);
        self.onHide && self.on('Hide', self.onHide);
        self.onPause && self.on('Pause', self.onPause);
        self.onQueryChange && self.on('QueryChange', self.onQueryChange);

        if (!self.$el.data('path')) {
            self.$el.data('url', self.url).data('path', self.path);
            async.then(self.loadTemplate, self);

        } else {
            self.onCreate();
        }

        async.then(self.checkQuery, self);
    },

    bindScrollTo: function (el, options) {
        var sbr = Scroll.bind(el, options);

        if (!this._scrolls) {
            this._scrolls = sbr;

        } else {
            this._scrolls.add(sbr);
        }
        return sbr;
    },

    getScrollView: function (el) {
        return this._scrolls.get(el);
    },

    loadTemplate: function () {

        var self = this,
            count = 1,
            callback = function () {
                count--;
                if (count == 0) {
                    self.$el.html(self.razor.html(self.data)).appendTo(self.application.$el);

                    self.onCreate();

                    self._async.resolve();
                }
            };

        if (self.route.api) {
            count++;
            $.ajax({
                url: self.route.api,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    self.data = res;
                    callback(res);
                },
                error: function (xhr) {
                    callback({ success: false, content: xhr.responseText });
                }
            });
        }

        seajs.use(self.route.template, function (razor) {
            self.razor = razor;
            callback();
        });

        return self._async;
    },

    onCreate: util.noop,

    //页面准备就绪，可加载数据
    onLoad: null,

    waitLoad: function () {
        var self = this;

        return new Promise(function (resolve, reject) {

        });
    },

    //进入动画结束时触发
    onShow: null,

    _onShow: function (e) {
        this._statusChange(e);

        if (!this._isShown || this.isForward) {
            this.onLoad && this.onLoad();
        }
        this._isShown = true;
    },

    _statusChange: function (e) {
        if (this._status == 'Pause') {
            this.trigger('Resume');
        }
        this._status = e.type;
    },

    //离开动画开始时触发
    onPause: null,

    //离开动画结束时触发
    onHide: null,

    onResume: null,

    onStop: null,

    onQueryChange: null,

    onResult: function (event, fn) {
        return this.listenTo(this.application, event, fn);
    },

    setResult: function () {
        this.application.trigger.apply(this.application, arguments);
        return this;
    },

    _onDestroy: function () {
        if (this._scrolls) this._scrolls.destory();
        this.application.remove(this.url);
    },

    compareUrl: function (url) {
        return getUrlPath(url) === this.route.path.toLowerCase();
    },

    then: function (fn) {
        this._async.then(fn, this);
        return this;
    },

    forward: function (url, duration, toggleAnim, data) {
        this.application.forward(url, duration, toggleAnim, data);
    },

    back: function (url, duration, toggleAnim, data) {
        this.application.back(url, duration, toggleAnim, data);
    },

    queryString: function (key, val) {
        var query = this.route.query;

        if (typeof val === 'undefined')
            return query[key];

        if (query[key] == val) return;

        else if (val === null || val === false || val === '')
            delete query[key];
        else
            query[key] = val;

        var queryString = $.param(query);

        this.route.url = this.url = this.route.path + (queryString ? '?' + queryString : '');

        this.application.navigate(this.url);

        var data = {};
        data[key] = val;

        this.trigger(new Event('QueryChange', {
            data: data
        }));
    },

    _queryActions: {},
    checkQuery: function () {
        var self = this;
        var query = self.query;
        var prevQueries = self._query;
        var actionName;

        $.each(self._queryActions, function (name, option) {
            actionName = query[name] || '';

            if ((actionName && !prevQueries) || (prevQueries && actionName != prevQueries[name])) {
                var action = option.map[actionName];
                if (!action.exec) {
                    action.fn.apply(option.ctx);
                } else {
                    action.exec = false;
                }
            }
        });
    },

    isExiting: false,
    _startExit: function () {
        var self = this;
        if (self.isExiting) return;
        self.isExiting = true;
        var application = self.application;
        if (application.activeInput) {
            application.activeInput.blur();
            application.activeInput = null;
        }
        application.mask.show();
        self.$el.removeClass('active');
    },

    _enterAnimationEnd: function () {
        var self = this;
        self.application.mask.hide();

        self.isExiting = false;
        self.then(function () {
            self.$el.addClass('active');
            self.trigger('Show');
        });
    }
});

module.exports = Activity;
