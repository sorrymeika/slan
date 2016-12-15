var $ = require('$'),
    util = require('util'),
    Base = require('./base'),
    Component = require('./component'),
    Async = require('./async');

var noop = util.noop,
    indexOf = util.indexOf,
    slice = Array.prototype.slice,
    getUrlPath = util.getPath;

var Page = Component.extend({
    el: '<div class="view"></div>',

    _template: function (res, err, done) {
        var that = this,
            count = 1,
            callback = function () {
                count--;
                if (count == 0) {
                    that.$el.html(that.razor.html(that.data)).appendTo(that.application.$el);
                    that.trigger("Create");

                    done();
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

        return that.async;
    },

    initialize: function (options) {
        var that = this,
            async = Async.done();

        that.async = async;

        options.fuckMe(this);

        that.application = options.application;

        that.on('Resume', that.onResume)
            .on('Show', that.onShow)
            .on('Show', that._statusChange)
            .on('Pause', that.onPause)
            .on('Pause', that._statusChange)
            .on('QueryChange', that.onQueryChange);

        if (!that.$el.data('path')) {
            that.$el.data('url', that.url).data('path', that.path);
            async.await(that._template, that);
        }
        async.await(that.onCreate, that);
    },

    onCreate: noop,
    onStart: noop,
    onResume: noop,

    //进入动画结束时触发
    onShow: noop,

    onStop: noop,

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
        this.async.await(fn, this);
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

        this.application.navigate(this.route.path + (query ? '?' + query : ''));
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