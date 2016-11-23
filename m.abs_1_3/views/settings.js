var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('../widget/loader');
var model = require('core/model2');
var animation = require('animation');
var userModel = require("models/user");
var popup = require('widget/popup');

return Activity.extend({

    onCreate: function() {
        var self = this;

        var user = userModel.get();

        this.model = new model.Model(this.$el, {
            back: self.swipeRightBackAction,
            title: '设置',
            user: user,
            version: sl.appVersion
        });

        this.model.logout = function(e) {

            setTimeout(function() {
                popup.confirm({
                    title: '温馨提示',
                    content: '你确认要退出登录',
                    cancelText: '取消',
                    cancelAction: function() {},
                    confirmText: '确定退出',
                    confirmAction: function() {
                        this.hide();

                        if (userModel.get()) {
                            userModel.set(null);
                            self.setResult("Logout");
                            self.back('/?tab=0');
                        } else {
                            self.forward('/login');
                        }
                    }
                });
            }, 100);

            return false;
        }

        this.bindScrollTo(this.model.refs.main);
    },

    onShow: function() {
        var self = this;
    },

    onDestory: function() {}
});