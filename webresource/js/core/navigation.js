define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Base = require('./base'),
        View = require('./view'),
        Route = require('./route'),
        appProto = require('./appProto'),
        Promise = require('./promise');

    var noop = util.noop,
        slice = Array.prototype.slice,
        getPath = util.getPath,
        trimHash = Route.trimHash,
        checkQueryString = appProto.checkQueryString;

    var Navigation = View.extend($.extend(appProto, {
        events: {
            'click a[href]:not(.js-link-default)': function (e) {
                var that = this,
                    target = $(e.currentTarget);

                if (!/^(http\:|https\:|javascript\:|mailto\:|tel\:)/.test(target.attr('href')) && target.attr('target') != '_blank') {
                    e.preventDefault();
                    var href = target.attr('href');
                    if (!/^#/.test(href)) href = '#' + href;

                    location.hash = href;
                    return false;

                } else {
                    target.addClass('js-link-default');
                }
            }
        },
        el: '<div class="screen" style="position:fixed;top:0px;bottom:0px;right:0px;width:100%;background:rgba(0,0,0,0);z-index:2000;display:none"></div><div class="viewport"></div>',
        initialize: function () {
            var that = this;

            that.$mask = $(that.$el[0]).on('click', false);
            that.el = that.$el[1];
            that.promise = Promise.resolve();
        },

        start: function () {
            var that = this,
                hash,
                $win = $(window),
                $body = $(document.body),
                $views = $body.find('.view');

            that.$el.appendTo($body);
            that.$el = $(that.el);

            if ($views.length) {
                that.$el.append($views.hide());
            }

            if (!location.hash) location.hash = '/';
            that.hash = hash = trimHash(location.hash);

            that.promise.then(function () {
                that.get(hash, function (activity) {
                    activity.$el.show().appendTo(that.el);
                    that._currentActivity = activity;

                    activity.then(function () {
                        activity.trigger('Resume').trigger('Show');

                        that.trigger('start');
                        that.promise.resolve();
                    });
                });

                $win.on('hashchange', function () {
                    hash = that.hash = trimHash(location.hash);

                    if (that.skip == 0) {

                        that.to(hash);

                    } else if (that.skip > 0)
                        that.skip--;
                    else
                        that.skip = 0;
                });

                return that.promise;
            });
            return that;
        },

        navigate: function (url) {
            url = trimHash(url);
            this.skip++;
            location.hash = url;
        },

        to: function (url) {
            url = trimHash(url);

            var that = this,
                promise = that.promise;

            promise.then(function () {
                var currentActivity = that._currentActivity,
                    route = that.route.match(url);

                if (promise.queue.length == 0 && url != trimHash(location.hash)) {
                    that.navigate(url);
                }

                if (currentActivity.path == route.path) {
                    checkQueryString(currentActivity, route);
                    promise.resolve();
                    return;
                }
                that.get(route, function (activity) {
                    checkQueryString(activity, route);

                    if (activity.path != currentActivity.path) {
                        that._currentActivity = activity;

                        if (activity.el.parentNode === null) activity.$el.appendTo(currentActivity.application.el);

                        activity.$el.show().siblings('.view').hide();

                        activity.then(function () {
                            activity.trigger('Resume').trigger('Show');
                        });
                    }
                    promise.resolve();
                });

                return promise;
            });
        }
    }));

    sl.Navigation = Navigation;

    module.exports = Navigation;
});
