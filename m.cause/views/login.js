define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var animation = require('animation');
    var userModel = require("models/user");
    var md5 = require("util/md5").md5;

    return Activity.extend({
        events: {
            'tap .js_login:not(.disabled)': function () {
                var email = this.model.get('email');
                var password = this.model.get('password');

                if (!email || !util.validateEmail(email)) {
                    sl.tip('请输入正确的邮箱地址');
                    return;
                }
                if (!password) {
                    sl.tip('请输入密码');
                    return;
                }

                this.loading.setParam({
                    email: email,
                    password: md5(password)

                }).load();
            }
        },

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
            });
            this.bindScrollTo(this.model.refs.main);

            this.loading = new Loading({
                url: '/api/user/signin',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if (!res.success) {
                        sl.tip(res.msg);

                    } else {
                        userModel.set(res.user);

                        self.back(self.route.query.success || "/");

                        self.setResult("Login");
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });
        },

        onShow: function () {
            var that = this;
        },

        onDestory: function () {
        }
    });
});
