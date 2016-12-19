var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Model = require('core/model2').Model;

var Loading = require('widget/loader');
var Scroll = require('widget/scroll');
var Loader = require('widget/loader');
var Toast = require('widget/toast');
var Tab = require('widget/tab');

var animation = require('animation');
var bridge = require('bridge');
var api = require('models/api');

var Share = require('components/share');
var userModel = require('models/user');

var user = require('logical/user');

module.exports = Activity.extend({

    useInv: function () {
        var data = this.model.data;

        this.back('/buy', {
            company: data.company,
            isCompany: data.isCompany,
            requireInv: data.requireInv
        });
    },

    onCreate: function () {
        var self = this;

        var $main = this.$('.main');

        this.bindScrollTo($main);

        self.user = userModel.get();

        var routeData = this.route.data;

        var model = new Model(this.$el, {
            back: this.swipeRightBackAction,
            title: '发票信息',
            user: self.user,
            company: routeData.company,
            isCompany: routeData.isCompany,
            requireInv: routeData.requireInv
        });

        this.model = model;
        model.useInv = this.useInv.bind(this);
    },

    onShow: function () {
        bridge.statusBar('dark');
    },

    onPause: function () {
        bridge.statusBar("light");
    },

    onDestroy: function () {
    }
});
