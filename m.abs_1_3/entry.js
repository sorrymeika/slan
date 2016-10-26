var $ = require('$');
var sl = require('core/base');
var util = require('util');
var bridge = require('bridge');
var Loader = require('widget/loader');
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');
var App = require('core/app');
var Scroll = require('widget/scroll');
var Model = require('core/model2').Model;

var ModelProto = Model.prototype;

ModelProto.bindScrollTo = function (el, options) {
    var sbr = Scroll.bind(el, options);

    if (!this._scrolls) {
        this._scrolls = sbr;

    } else {
        this._scrolls.add(sbr);
    }
    return sbr;
}

ModelProto.getScrollView = function (el) {
    return this._scrolls.get(el);
}

var oldModelDestroy = ModelProto.destory;
ModelProto.destory = function () {
    oldModelDestroy.call(this);

    if (this._scrolls) this._scrolls.destory();
}


function startApp(routes, resourceMapping, remoteRoutes, remoteMapping) {

    $.extend(routes, remoteRoutes || {});

    seajs.on('fetch', function (emitData) {

        var id = emitData.uri.replace(seajs.data.base, '').replace(/\.js(\?.*){0,1}/, '');

        if (remoteMapping && remoteMapping[id]) {
            emitData.requestUri = remoteMapping[id];

        } else if (resourceMapping) {

            for (var key in resourceMapping) {
                if (resourceMapping[key].indexOf(id) != -1) {
                    emitData.requestUri = remoteMapping && remoteMapping[key] ? remoteMapping[key] : seajs.resolve(key);
                    break;
                }
            }
        }
    });
    seajs.on("error", function (errorData) {
        errorData.pause = true;

        console.log("can not fetch:", errorData.uri);

        Offline.getInstance().show(function () {
            this.hide();
            seajs.request(errorData.uri, errorData.callback);
        });
    });

    new App().mapRoute(routes).start(sl.isInApp ? 2000 : 0);
}

function startAppWithRemoteMapping(remoteUrl, routes, resourceMapping) {
    function loadResourceMapping() {
        loader.reload();
    }

    var loader = new Loader({
        url: remoteUrl,
        params: {
            v: sl.appVersion
        },
        timeout: 5000,
        checkData: false,
        $el: $('body'),
        error: function () {
            Offline.getInstance().show(loadResourceMapping);
            console.log("cantload:" + remoteUrl);
        },
        success: function (res) {
            Offline.getInstance().hide();

            entry.startApp(routes, resourceMapping, res.routes, res.data);
        }

    });
    loadResourceMapping();
}

module.exports = {
    startApp: startApp,
    startAppWithRemoteMapping: startAppWithRemoteMapping
};