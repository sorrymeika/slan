var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;

var Scroll = require('widget/scroll');
var api = require('models/api');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '寻找店铺',
            mapUrl: Loader.url("/baiduMap.html?v4"),
            width: window.innerWidth,
            height: window.innerHeight - 44 - (util.isInApp && util.ios ? 20 : 0)
        });

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        Scroll.bind(model.refs.main);
    },

    onShow: function () {
        var self = this;

        bridge.getLocation(function (res) {
            self.model.set({
                mapUrl: Loader.url("/baiduMap.html?v3#longitude=" + res.longitude + "&latitude=" + res.latitude)
            });
        });
    },

    onDestory: function () {
    }
});
