var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loader = require('../widget/loader');
var Model = require('core/model2').Model;
var Scroll = require('../widget/scroll');
var Slider = require('../widget/slider');
var animation = require('animation');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = self.model = new Model(this.$el, {
            title: '缘起之因'
        });

        Scroll.bind(this.$('.main'));


        model.changeTab = function (e, tab) {
            this.set({
                tab: tab
            })
        }

    },

    onLoad: function () {

    },

    onShow: function () {
        var self = this;
    },

    onHide: function () {
    },

    onDestory: function () {
        this.model.destory();
    }
});
