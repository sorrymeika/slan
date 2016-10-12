var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Model = require('core/model2').Model;

var Loading = require('widget/loader');
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

    usePoint: function () {
        var points = this.model.data.points;

        if (points != '' && !/^\d+$/.test(points)) {
            Toast.showToast('请输入正确的积分');
            return;
        }
        points = parseFloat(points);

        if (!points) {

            this.back('/buy', {
                points: 0
            });
            return;
        }
        if (points > this.user.Points) {
            Toast.showToast('您输入的数值已超过您的积分最大值，请重新输入');
            return;
        }
        else if (points < 100 || points % 100 != 0) {
            Toast.showToast('您输入的数值不是100的倍数，请重新输入');
            return;
        }

        this.back('/buy', {
            points: points
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
            title: '使用积分兑换',
            user: self.user,
            points: routeData.points
        });

        this.model = model;
        model.usePoint = this.usePoint.bind(this);
    },

    onShow: function () {
        bridge.statusBar('dark');
    },

    onPause: function () {
        bridge.statusBar("light");
    },

    onDestory: function () {
    }
});
