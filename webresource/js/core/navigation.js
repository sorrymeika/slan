define(function(require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Base = require('./base'),
        Route = require('./route'),
        appProto = require('./appProto'),
        Component = require('./component'),
        Async = require('./async');

    var noop = util.noop,
        slice = Array.prototype.slice,
        getPath = util.getPath,
        checkQueryString = appProto.checkQueryString;

    var Navigation = Component.extend($.extend(appProto, {
        events: {
            'click a[href]:not(.js-link-default)': function(e) {
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
        initialize: function(options) {
            var that = this;

            that.$mask = $(that.$el[0]).on('click', false);
            that.el = that.$el[1];
            that.async = Async.done();

            options.routes && this.mapRoutes(options.routes);
        },

        start: function() {
            var that = this,
                $win = $(window),
                $body = $(document.body),
                $views = $body.find('.view');

            that.$el.appendTo($body);
            that.$el = $(that.el);

            if ($views.length) {
                that.$el.append($views.hide());
            }

            if (!location.hash) location.hash = '/';
            that.hash = Route.formatUrl(location.hash);

            that.async.then(function(err, res, done) {
                that.get(that.hash, function(activity) {
                    activity.$el.show().appendTo(that.el);
                    that._currentActivity = activity;

                    activity.then(function() {
                        activity.trigger('Resume').trigger('Show');

                        that.trigger('start');
                        done();
                    });
                });

                $win.on('hashchange', function() {
                    that.hash = Route.formatUrl(location.hash);

                    if (that.skip == 0) {

                        that.to(that.hash);

                    } else if (that.skip > 0)
                        that.skip--;
                    else
                        that.skip = 0;
                });

                return this;
            });

            return that;
        },

        navigate: function(url) {
            url = Route.formatUrl(url);
            this.skip++;
            location.hash = url;
        },

        to: function(url) {
            url = Route.formatUrl(url);

            var that = this,
                async = that.async;

            async.await(function(err, res, done) {
                var currentActivity = that._currentActivity,
                    route = that.route.match(url);

                if (async.queue.length == 0 && !Route.compareUrl(url, location.hash)) {
                    that.navigate(url);
                }

                if (currentActivity.path == route.path) {
                    checkQueryString(currentActivity, route);
                    done();
                    return;
                }
                that.get(route, function(activity) {
                    checkQueryString(activity, route);

                    if (activity.path != currentActivity.path) {
                        that._currentActivity = activity;

                        if (activity.el.parentNode === null) activity.$el.appendTo(currentActivity.application.el);

                        activity.$el.show().siblings('.view').hide();

                        activity.then(function() {
                            activity.trigger('Resume').trigger('Show');
                        });
                    }
                    done();
                });

                return async;
            });
        }
    }));

    sl.Navigation = Navigation;

    module.exports = Navigation;
});