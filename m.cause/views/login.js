define(function(require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var userModel = require("models/user");

    return Activity.extend({
        events: {
            'tap .js_login:not(.disabled)': function() {
                var mobile = this.model.get('mobile');
                var smsCode = this.model.get('smsCode');

                if (!mobile || !util.validateMobile(mobile)) {
                    sl.tip('请输入正确的手机');
                    return;
                }
                if (!smsCode) {
                    sl.tip('请输入密码');
                    return;
                }

                this.loading.setParam({
                    mobile: mobile,
                    smsCode: smsCode,
                    platform: navigator.platform,
                    deviceVersion: (util.ios ? "IOS " : "Android ") + util.osVersion,
                    version: sl.appVersion

                }).load();
            }
        },

        onCreate: function() {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
            });
            Scroll.bind(this.model.refs.main);

            this.loading = new Loading({
                url: '/api/user/login',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function(res) {
                    if (!res.success) {
                        sl.tip(res.msg);

                    } else {
                        userModel.set(res.data);

                        self.back(self.route.query.success || "/");

                        self.setResult("Login");
                    }
                },
                error: function(res) {
                    sl.tip(res.msg);
                }
            });
        },

        onShow: function() {
            var that = this;
        },

        onDestory: function() {
        }
    });
});
