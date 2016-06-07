define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('core/model2');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var userModel = require("models/user");

    return Activity.extend({
        events: {
            'tap .js_bind:not(.disabled)': function () {
            }
        },

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);
            self.swipeRightBackAction = self.route.query.from || '/';

            var user = userModel.get();

            this.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: '设置',
                user: user,
                logout: function (e) {
                    self.confirm("你确认要退出登录?", function () {
                        if (userModel.get()) {
                            userModel.set(null);
                            self.setResult("Logout");
                            self.back('/');
                        } else {
                            self.forward('/login');
                        }
                    });
                }
            });
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
