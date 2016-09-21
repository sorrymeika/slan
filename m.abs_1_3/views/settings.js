
var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('../widget/loading');
var model = require('core/model2');
var Scroll = require('../widget/scroll');
var animation = require('animation');
var userModel = require("models/user");

return Activity.extend({

    onCreate: function () {
        var self = this;

        var user = userModel.get();

        this.model = new model.Model(this.$el, {
            back: self.swipeRightBackAction,
            title: '设置',
            user: user,
            version: sl.appVersion
        });

        this.model.logout = function (e) {
            self.confirm("你确认要退出登录?", function () {
                if (userModel.get()) {
                    userModel.set(null);
                    self.setResult("Logout");
                    self.back('/?tab=1');
                } else {
                    self.forward('/login');
                }
            });
            return false;
        }

        Scroll.bind(this.model.refs.main);
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
