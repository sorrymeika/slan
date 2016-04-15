define(function(require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var api = require('models/api');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var userModel = require("models/user");
    var md5 = require("util/md5").md5;

    return Activity.extend({
        events: {
            'tap .js_login:not(.disabled)': function() {
                var email = this.model.get('email');
                var password = this.model.get('password');
                var password1 = this.model.get('password1');
                var validcode = this.model.get('validcode');

                if (!email || !util.validateEmail(email)) {
                    sl.tip('请输入正确的邮箱地址');
                    return;
                }
                if (!password) {
                    sl.tip('请输入密码');
                    return;
                }
                if (password1 != password) {
                    sl.tip('两次密码不一致');
                    return;
                }
                if (!validcode) {
                    sl.tip('请输入验证码');
                    return;
                }

                this.request.setParam({
                    email: email,
                    password: md5(password),
                    validcode: this.model.data.validcode,
                    version: sl.appVersion,
                    token: util.store('token')

                }).load();
            }
        },

        onCreate: function() {
            var self = this;

            this.swipeRightBackAction = this.route.query.from || '/login';

            this.model = new model.ViewModel(this.$el, {
                back: this.swipeRightBackAction,
                validcodeImg: api.url("/api/user/captcha?token=" + util.store('token'))
            });

            Scroll.bind(this.model.refs.main);

            this.request = new api.API({
                url: '/api/user/signup',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function(res) {
                    if (!res.success) {

                        sl.tip(res.msg);

                        self.model.set({
                            now: Date.now()
                        });

                    } else {
                        //var backUrl = self.route.query.success || "/";

                        userModel.set(res.user);
                    }
                },
                error: function(res) {
                    sl.tip(res.msg);
                }
            });

        },

        onShow: function() {
            var self = this;

            self.model.set({
                now: Date.now()
            });
        },

        onDestory: function() {
        }
    });
});
