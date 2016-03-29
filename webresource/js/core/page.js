var $ = require('$'),
    util = require('util'),
    Base = require('./base'),
    view = require('./view'),
    Promise = require('./promise'),
    Dialog = require('../widget/dialog');

require('../widget/tip');

var noop = util.noop,
    indexOf = util.indexOf,
    slice = Array.prototype.slice,
    getUrlPath = util.getPath;

var Page = view.extend({
    options: {
        route: null
    },
    application: null,
    el: '<div class="view"></div>',

    _setRoute: function (route) {
        this.route = route;
        this.hash = route.hash;
        this.url = route.url;
        this.path = route.path;
        this._query = this.query;
        this.query = $.extend({}, route.query);
    },

    loadTemplate: function () {
        var that = this,
            count = 1,
            callback = function () {
                count--;
                if (count == 0) {
                    that.$el.html(that.razor.html(that.data)).appendTo(that.application.$el);
                    that.trigger("Create");
                    that._promise.resolve();
                }
            };

        if (that.route.api) {
            count++;
            $.ajax({
                url: that.route.api,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    that.data = res;
                    callback(res);
                },
                error: function (xhr) {
                    callback({ success: false, content: xhr.responseText });
                }
            });
        }

        seajs.use(that.route.template, function (razor) {
            that.razor = razor;
            callback();
        });

        return that._promise;
    },

    initialize: function () {
        var that = this,
            promise = Promise.resolve();

        that._promise = promise;
        that.className = that.el.className;

        that._setRoute(that.options.route);

        that.application = that.options.application;

        that.on('Start', that.onStart)
            .on('Resume', that.onResume)
            .on('Show', that.onShow)
            .on('Show', that._statusChange)
            .on('Pause', that.onPause)
            .on('Pause', that._statusChange)
            .on('QueryChange', that.onQueryChange)
            .on('QueryChange', that.checkQuery);

        if (!that.$el.data('path')) {
            that.$el.data('url', that.url).data('path', that.path);
            promise.then(that.loadTemplate, that);
        }
        promise.then(that.onCreate, that)
            .then(function () {
                that.trigger('Start');
                that.checkQuery();
            });
    },

    onCreate: noop,
    onStart: noop,
    onResume: noop,

    //进入动画结束时触发
    onShow: noop,

    onStop: noop,
    onRestart: noop,

    //离开动画结束时触发
    onPause: noop,

    _statusChange: function (e) {
        if (this._status == 'Pause') {
            this.trigger('Resume');
        }
        this._status = e.type;
    },

    onQueryChange: noop,

    then: function (fn) {
        this._promise.then(fn, this);
        return this;
    },

    queryString: function (key, val) {
        if (typeof val === 'undefined')
            return this.route.query[key];

        else if (val === null || val === false || val === '')
            delete this.route.query[key];
        else
            this.route.query[key] = val || '';

        var query = $.param(this.route.query);
        location.hash = this.route.path + (query ? '?' + query : '');
    },

    _queryActions: {},
    checkQuery: function () {
        var that = this;
        var query = that.query;
        var prevQueries = that._query;
        var actionName;

        $.each(that._queryActions, function (name, option) {
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

    bindQueryAction: function (name, ctx, fnMap) {
        var that = this;
        var newFn;
        var map = {};
        var option = {
            ctx: ctx,
            map: map
        };

        $.each(fnMap, function (key, functionName) {
            var functionName = fnMap[key];
            var fn = ctx[functionName];
            var action = {
                fn: fn,
                exec: false
            };

            map[key] = action;

            ctx[functionName] = function () {
                fn.apply(ctx, arguments);

                if (that.queryString(name) != key) {
                    action.exec = true;
                    that.queryString(name, key);
                }
            }
        });

        this._queryActions[name] = option;
        return this;
    },

    onResult: function (event, fn) {
        return this.listenTo(this.application, event, fn);
    },

    setResult: function () {
        this.application.trigger.apply(this.application, arguments);
        return this;
    },

    compareUrl: function (url) {
        return getUrlPath(url) === this.route.path.toLowerCase();
    },
    back: function (url) {
        this.application.to(url);
    },
    forward: function (url) {
        this.application.to(url);
    }
});

sl.Page = Page;

module.exports = Page;