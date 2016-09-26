var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Model = require('core/model2').Model;

var Loading = require('widget/loader');
var Scroll = require('widget/scroll');
var Loader = require('widget/loader');
var Toast = require('widget/toast');

var animation = require('animation');
var bridge = require('bridge');
var api = require('models/api');

var Share = require('components/share');
var userModel = require('models/user');

var user = require('logical/user');

module.exports = Activity.extend({
    events: {
        'tap .coupon_tip': function () {
            util.store('showTipStep', 3);
            this.model.set({
                showTipStep: 3
            })
        }
    },

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

        user.recieveCoupon(code, function (err, res) {

            if (res.success) {
                self.showToast('suc', '领取成功');
                self.loadData();

            } else {
                self.showToast('error', err.msg);
            }
        }, this.$el);
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

        user.getCouponList(function (err, res) {

            if (err) {
                Toast.showToast(err.msg);
                return;
            }

            res.data.sort(function (a, b) {
                return a.IsOverdue && !b.IsOverdue ? 1 : !a.IsOverdue && b.IsOverdue ? -1 : a.CSV_END_DT > b.CSV_END_DT ? 1 : a.CSV_END_DT == b.CSV_END_DT ? 0 : -1;
            });

            self.model.set({
                closeNumber: res.closeNumber,
                data: res.data
            });

        }, this.$el);
    },

    onCreate: function () {
        var self = this;

        this.loadData();

        var $main = this.$('.main');

        Scroll.bind($main);

        self.user = userModel.get();

        var model = new Model(this.$el, {
            back: this.swipeRightBackAction,
            title: '我的卡券',
            showTipStep: util.store('showTipStep')
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
    },

    onDestory: function () {
    }
});
