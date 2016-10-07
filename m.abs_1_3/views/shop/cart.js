define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loader');
    var model = require('core/model2');
    var Promise = require('core/promise');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var api = require("models/api");
    var Deletion = require("components/deletion");
    var Cart = require("components/cart");
    var userModel = require("models/user");

    return Activity.extend({

        onCreate: function () {
            var self = this;

            self.user = userModel.get();

            var cart = new Cart();

            self.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: '我的购物车',
                user: self.user,
                cart: cart
            });

            cart.$el.appendTo(this.model.refs.cart);
        },

        onShow: function () {
            var self = this;

            self.user = userModel.get();


            self.model.set({
                user: self.user,
                back: self.swipeRightBackAction
            });

        },

        initCoupon: function () {
            var self = this;

            self.$coupon = self.$('.js_coupon');
            self.listenTo(self.$coupon, $.fx.transitionEnd, function (e) {
                if (self.$coupon.hasClass('out')) {
                    self.$coupon.hide();
                }
            });

            this.model.couponGetApi = new api.CouponAPI({
                $el: this.$el,
                checkData: false,
                beforeSend: function () {
                    var code = self.model.get('code');
                    if (!code) {
                        sl.tip('请输入券号');
                        return false;
                    }
                    this.setParam({
                        csvcode: code
                    });
                },
                params: {
                    pspcode: self.user.PSP_CODE
                },
                success: function (res) {
                    if (res.success) {
                        sl.tip('领取成功');
                        self.cart.reload();

                    } else {
                        sl.tip(res.msg);
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });

        },

        onDestory: function () {
        }
    });
});
