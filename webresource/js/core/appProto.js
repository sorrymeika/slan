define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Route = require('./route');

    var Event = require('./event');

    require('widget/tip');

    var getPath = util.getPath;

    var Master = {
        checkQueryString: function (activity, route) {
            if (route.data) {
                Object.assign(activity.route.data, route.data);
            }

            console.log(activity.route.url, route.url)

            if (activity.route.url != route.url) {
                route.data = activity.route.data;

                activity._setRoute(route);

                var diff = {};
                var before;

                for (var key in activity.query) {
                    if (!(key in activity._query)) {
                        activity._query[key] = undefined;
                    }
                }
                for (var key in activity._query) {
                    before = activity._query[key];

                    if (before != activity.query[key]) {
                        diff[key] = before;
                    }
                }

                activity.trigger(new Event('QueryChange', {
                    data: diff
                }));
            }
        },

        mapRoute: function (routes) {
            this.route = new Route(routes);
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
                activity._setReferrer(route);

                callback.call(that, activity, route);
            }
        },

        remove: function (url) {
            this._activities[getPath(url)] = null;
        }
    };

    module.exports = Master;
});
