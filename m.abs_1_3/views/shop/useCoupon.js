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

        user.recieveCoupon(code, function (res) {

            self.showToast('suc', '领取成功');
            self.loadData();

        }, this.$el).catch(function (err) {
            self.showToast('error', err.msg);
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

        user.getCouponList(function (err, res) {

            if (err) {
                Toast.showToast(err.msg);
                return;
            }

            var data = [];
            var cannotuse = [];
            var coupons = self.route.data.coupon;
            var isFree = self.route.data.isFree;

            res.data.forEach(function (item) {
                if (!item.isOverdue && (isFree ? item.VCA_VCT_ID == 4 : (item.VCA_VCT_ID != 4))) {
                    if (-1 == util.indexOf(coupons, function (a) {
                        return a.CSV_ID == item.CSV_ID;
                    })) {
                        cannotuse.push(item);
                    } else {
                        data.push(item);
                    }
                }
            });

            data.sort(function (a, b) {
                return a.CSV_END_DT > b.CSV_END_DT ? 1 : a.CSV_END_DT == b.CSV_END_DT ? 0 : -1;
            });

            self.model.set({
                data: data,
                cannotuse: cannotuse
            });

        }, this.$el);
    },
    useCoupon: function () {

        console.log(this.model.data.coupon);

        this.back('/buy', {
            coupon: this.model.data.coupon,
            freeCoupon: this.model.data.freeCoupon
        });
    },

    selectCoupon: function (coupon) {
        var self = this;
        var data = this.data;

        if (coupon.VCA_VCT_ID == 1 && coupon.VCA_MIN_AMOUNT > data.bag_amount) {
            Toast.showToast('您的购物金额满' + coupon.VCA_MIN_AMOUNT + '元才可使用哦');
            return;
        }

        if (coupon.VCA_VCT_ID == 4) {
            this.set({
                freeCoupon: data.freeCoupon && data.freeCoupon.CSV_CODE == coupon.CSV_CODE
                    ? null
                    : coupon
            });

        } else if (coupon.VCA_VCT_ID == 5) {
            var usedCoupons = this.data.usedCoupons || [];
            var index = util.indexOf(usedCoupons, function (item) {
                return item.CSV_CODE == coupon.CSV_CODE;
            });

            if (index != -1) {
                usedCoupons.splice(index, 1);
            } else {
                usedCoupons.push(coupon);
            }

            var codes = [];
            var amount = 0;
            usedCoupons.forEach(function (item) {
                codes.push(item.CSV_CODE);
                amount += item.VCA_DEDUCT_AMOUNT;
            });

            this.set({
                usedCoupons: usedCoupons,
                coupon: {
                    VCA_VCT_ID: 5,
                    VCA_DEDUCT_AMOUNT: amount,
                    CSV_CODE: codes.join(',')
                }
            });

        } else {
            this.set({
                usedCoupons: [],
                coupon: data.coupon && data.coupon.CSV_CODE == coupon.CSV_CODE
                    ? null
                    : coupon
            })
        }

    },

    onCreate: function () {
        var self = this;

        this.loadData();

        var $main = this.$('.main');

        this.bindScrollTo($main);

        self.user = userModel.get();

        var props = this.route.data || {};
        var model = new Model(this.$el, {
            back: this.swipeRightBackAction,
            title: '使用优惠券',
            bag_amount: props.bag_amount
        });

        this.model = model;
        model.receiveCoupon = this.receiveCoupon.bind(this);
        model.useCoupon = this.useCoupon.bind(this);
        model.selectCoupon = this.selectCoupon;
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
