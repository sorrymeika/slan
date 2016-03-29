define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        View = require('./view'),
        Route = require('./route');

    var getPath = util.getPath;

    var Master = {
        checkQueryString: function (activity, route) {
            if (activity.route.url != route.url) {
                activity._setRoute(route);
                activity.trigger('QueryChange');
            }
        },

        mapRoute: function (routes, isDebug) {
            this.route = new Route(routes, isDebug);
            return this;
        },
        skip: 0,

        _currentActivity: null,
        _activities: {},

        set: function (url, activity) {
            this._activities[getPath(url)] = activity;
        },

        get: function (url, callback) {
            var that = this,
                route = typeof url === 'string' ? that.route.match(url) : url;

            if (!route) {
                return;
            }

            var path = getPath(route.path);
            var activity = this._activities[path];

            if (activity == null) {
                (function (fn) {
                    route.package ? seajs.use(route.package + ".js?v" + sl.buildVersion, fn) : fn();

                })(function () {

                    seajs.use(route.view, function (Activity) {
                        var options = {
                            application: that,
                            route: route
                        },
                            $el;

                        if (null != Activity) {
                            $el = that.$el.find('[data-path="' + route.path + '"]');
                            if ($el.length) {
                                options.el = $el;
                            }

                            activity = new Activity(options);
                            that.set(path, activity);

                            activity.then(function () {
                                callback.call(that, activity, route);
                            });

                        } else {
                            that.skip++;
                            location.hash = that._currentActivity.url;
                        }
                    });
                });

            } else {
                callback.call(that, activity, route);
            }
        },

        remove: function (url) {
            this._activities[getPath(url)] = void 0;
        }
    };

    module.exports = Master;
});
