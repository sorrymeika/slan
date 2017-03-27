var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Model = require('core/model2').Model;

var Loading = require('widget/loader');
var Loader = require('widget/loader');
var Toast = require('widget/toast');

var animation = require('animation');
var bridge = require('bridge');
var api = require('models/api');

var Share = require('components/share');
var userModel = require('models/user');

var user = require('logical/user');

module.exports = Activity.extend({

    receiveCoupon: function () {
        var self = this;
        if (!self.model.data.puttingCoupon) {
            self.model.set({
                puttingCoupon: 1
            })
            return;
        }

        var code = self.model.get('code');
        if (!code) {

            self.showToast('error', '请输入券号');

            return false;
        }

        user.recieveCoupon(code, this.$el).then(function (res) {

            self.showToast('suc', '领取成功');
            self.loadData();

        }).catch(function (e) {
            self.showToast('error', e.message);
        });
    },

    showToast: function (type, msg) {
        var self = this;

        self.model.set({
            isShowToast: true,
            toastMsg: msg,
            toastType: type
        });
        setTimeout(function () {
            self.model.set('isShowToast', false);
        }, 1200);
    },

    loadData: function () {
        var self = this;

        user.getCouponList(this.$el).then(function (res) {

            res.data.sort(function (a, b) {
                return a.IsOverdue && !b.IsOverdue ? 1 : !a.IsOverdue && b.IsOverdue ? -1 : a.CSV_END_DT > b.CSV_END_DT ? 1 : a.CSV_END_DT == b.CSV_END_DT ? 0 : -1;
            });

            self.model.set({
                closeNumber: res.closeNumber,
                data: res.data
            });
        });
    },

    onCreate: function () {
        var self = this;

        this.loadData();

        var $main = this.$('.main');

        this.bindScrollTo($main);

        self.user = userModel.get();

        var model = new Model(this.$el, {
            back: this.swipeBack,
            title: '我的卡券'
        });

        this.model = model;

        model.goTo = function (item) {
            if (item.LVP_PRD_ID) {
                self.forward("/item/" + item.LVP_PRD_ID + "?from=" + encodeURIComponent(self.route.url));
                return false;
            }
        }
        model.detail = function (item) {
            console.log(item);

            self.forward("/coupon/" + item.CSV_ID);
        }

        model.receiveCoupon = this.receiveCoupon.bind(this);
    },

    onShow: function () {
        if (!userModel.get()) {
            this.forward('/login?success=' + this.route.url + "&from=/");
        }

        bridge.statusBar('dark');
    },

    onPause: function () {
        bridge.statusBar("light");
    },

    onDestroy: function () {
    }
});
