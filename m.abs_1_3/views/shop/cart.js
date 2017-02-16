define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loader');
    var model = require('core/model2');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var api = require("models/api");
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

            this.onResult('CartChange', function () {
                cart.cartApi.load();
            });

            this.bindScrollTo(cart.refs.main);
        },

        onShow: function () {
            var self = this;

            self.user = userModel.get();

            self.model.set({
                user: self.user,
                back: self.swipeRightBackAction
            });

        },

        onDestroy: function () {
        }
    });
});
