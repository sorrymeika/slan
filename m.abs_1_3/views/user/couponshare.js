var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/base');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function() {
        }
    },

    onCreate: function() {
        var self = this;
        var $main = self.$('.main');

        self.swipeRightBackAction = undefined;

        Scroll.bind($main);

        self.model = new model.ViewModel(this.$el, {
        });

        self.model.getCoupon = function(e) {
            if (!self.user) {
                self.forward('/login?success=' + encodeURIComponent(self.route.url) + '&from=' + encodeURIComponent(self.route.url));
            } else {
                getSharedCouponAPI.setParam({
                    UserID: self.user.ID,
                    Auth: self.user.Auth

                }).load();
            }
        };

        var getSharedCouponAPI = new api.GetSharedCouponAPI({
            $el: self.$el,
            params: {
                data: self.route.query.code
            },
            checkData: false,
            success: function(res) {
                sl.tip("恭喜您获得一张优惠券");

            },

            error: function(res) {
                sl.tip(res.msg);
            }
        });

        var couponUserAPI = new api.CouponUserAPI({
            $el: self.$('.co_share_user .list'),
            params: {
                data: self.route.query.code
            },
            checkData: false,
            success: function(res) {
                console.log(res)

                self.model.set({
                    users: res.data,
                    user: res.user
                });
            }
        });
        couponUserAPI.load();
    },

    onShow: function() {
        var self = this;

        self.user = util.store('user');
    },

    onDestory: function() {
    }
});
