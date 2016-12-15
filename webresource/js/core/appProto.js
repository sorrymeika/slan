
var $ = require('$'),
    util = require('util'),
    Route = require('./route');

var Event = require('./event');
var getPath = util.getPath;


function setActivityReferrer(activedInstance, route) {
    activedInstance.isForward = route.isForward;

    if (route.isForward) {
        var currActivity,
            prevRoute = route,
            prevActivity = activedInstance;

        while ((currActivity = prevRoute.prevActivity) && (prevActivity = currActivity.route.prevActivity) && prevRoute) {
            if (prevActivity == activedInstance) {
                currActivity.route.prevActivity = activedInstance.route.prevActivity;
                currActivity.referrer = currActivity.route.referrer = activedInstance.referrer;
                currActivity.referrerDir = currActivity.route.referrerDir = activedInstance.referrerDir;
                currActivity.swipeRightBackAction = activedInstance.swipeRightBackAction;
                break;
            }
            prevRoute = prevActivity.route;
        }

        activedInstance.referrer = route.referrer;
        activedInstance.referrerDir = route.referrerDir;
    }

    if (activedInstance.autosetBackUrl) {
        backUrl = route.query.from || activedInstance.referrer || activedInstance.defBackUrl;

        getPath(backUrl) != route.path.toLowerCase() && (activedInstance.swipeRightBackAction = backUrl);
    }
}

function setActivityRoute(activity, route) {
    activity._query = $.extend({}, activity.query);

    activity.route = route;
    activity.hash = route.hash;
    activity.url = route.url;
    activity.path = route.path;
    activity.query = route.query;
}

function fuckActivity(activity) {
    setActivityReferrer(activity, this.route);
    setActivityRoute(activity, this.route);
}


var ActivityManager = {

    checkQueryString: function(activity, route) {
        if (route.data) {
            Object.assign(activity.route.data, route.data);
        }

        if (activity.route.url != route.url) {
            route.data = activity.route.data;

            setActivityRoute(activity, route);

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

    mapRoutes: function(routes) {
        this.route = new Route(routes);
        return this;
    },
    skip: 0,

    _currentActivity: null,
    _activities: {},

    set: function(url, activity) {
        this._activities[getPath(url)] = activity;
    },

    get: function(url, callback) {
        var that = this,
            route = typeof url === 'string' ? that.route.match(url) : url;

        if (!route) {
            return;
        }

        var path = getPath(route.path);
        var activity = this._activities[path];

        if (activity == null) {
            (function(fn) {
                route.package ? seajs.use(route.package + ".js?v" + sl.buildVersion, fn) : fn();

            })(function() {

                seajs.use(route.view, function(Activity) {
                    var $el,
                        options = {
                            application: that,
                            route: route,
                            fuckMe: fuckActivity
                        };

                    if (null != Activity) {
                        $el = that.$el.find('[data-path="' + route.path + '"]');
                        if ($el.length) {
                            options.el = $el;
                        }

                        activity = new Activity(options);

                        that.set(path, activity);

                        activity.then(function() {

                            callback.call(that, activity, route);
                        });

                    } else {
                        that.skip++;
                        location.hash = that._currentActivity.url;
                    }
                });
            });

        } else {
            setActivityReferrer(activity, route);

            callback.call(that, activity, route);
        }
    },

    remove: function(url) {
        this._activities[getPath(url)] = null;
    }
};

module.exports = ActivityManager;
