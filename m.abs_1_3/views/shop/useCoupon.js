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

    onCreate: function () {
        var self = this;

        this.loadData();

        var $main = this.$('.main');

        this.bindScrollTo($main);

        self.user = userModel.get();

        var props = this.route.data || {};

        var model = new Model(this.$el, {
            back: this.swipeBack,
            title: '使用优惠券',
            isFree: props.isFree,
            bag_amount: props.bag_amount,
            coupon: props.selected
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

    onDestroy: function () {
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

        user.recieveCoupon(code, this.$el).then(function (res) {

            self.showToast('suc', '领取成功');

            user.getCart().then(function (res) {

                self.route.data.coupon = res.coupon;
                self.loadData();
            })

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
            var data = [];
            var cannotuse = [];
            var coupons = self.route.data.coupon || [];
            var isFree = self.route.data.isFree;


            if (res.data) {
                res.data.forEach(function (item) {
                    if (!item.isOverdue) {
                        if (isFree) {
                            if (item.VCA_VCT_ID == 4)
                                data.push(item);

                        } else if (item.VCA_VCT_ID != 4) {

                            if (-1 == util.indexOf(coupons, function (a) {
                                return a.CSV_ID == item.CSV_ID;
                            })) {
                                cannotuse.push(item);
                            } else {
                                data.push(item);
                            }
                        }
                    }
                });
            }

            data.sort(function (a, b) {
                return a.CSV_END_DT > b.CSV_END_DT ? 1 : a.CSV_END_DT == b.CSV_END_DT ? 0 : -1;
            });

            var usedCoupons = [];
            var selected = self.model.get('coupon');

            if (selected && selected.CSV_CODE) {
                var codes = selected.CSV_CODE.split(',');
                data.forEach(function (item) {
                    if (codes.indexOf(item.CSV_CODE) != -1) {
                        usedCoupons.push(item);
                    }
                });
            }

            self.model.set({
                data: data,
                usedCoupons: usedCoupons,
                cannotuse: cannotuse
            });

        }, function (err) {
            Toast.showToast(err.message);
        });
    },
    useCoupon: function () {
        var model = this.model;

        this.back('/buy', model.get('isFree') ? {
            freeCoupon: this.model.data.coupon
        } : {
                coupon: this.model.data.coupon
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
                coupon: coupon
            });

        } else if (coupon.VCA_VCT_ID == 5) {
            var usedCoupons = [].concat(this.data.usedCoupons);
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

    }
});
