define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var md5 = require('util/md5');

    return Activity.extend({
        events: {
            'tap .js_bind:not(.disabled)': function () {
                var mobile = this.model.data.mobile;
                var password = this.model.data.password;
                var password1 = this.model.data.password1;
                var smsCode = this.model.data.smsCode;

                if (!mobile || !util.validateMobile(mobile)) {
                    sl.tip('请输入正确的手机');
                    return;
                }
                if (password != password1) {
                    sl.tip('两次密码输入不一致');
                    return;
                }
                if (!smsCode) {
                    sl.tip('请输入验证码');
                    return;
                }

                this.loading.setParam({
                    mobile: mobile,
                    password: md5.md5(password),
                    smsCode: smsCode
                }).load();
            },
            'tap .js_valid:not(.disabled)': function (e) {
                var mobile = this.model.get('mobile');
                if (!mobile || !util.validateMobile(mobile)) {
                    sl.tip('请输入正确的手机');
                    return;
                }

                this.$valid.addClass('disabled');
                this.valid.setParam({
                    mobile: this.model.data.mobile
                });
                this.valid.load();
            }
        },

        validTimeout: function () {
            var self = this;
            var sec = localStorage.getItem('valid_time');

            if (sec && parseInt(sec) > 60) {
                sec = Math.round((new Date(parseInt(sec)).getTime() - Date.now()) / 1000);

                if (sec <= 0) return;

                self.$valid.addClass('disabled');

                setTimeout(function () {
                    if (sec <= 0) {
                        self.$valid.removeClass('disabled');
                        self.model.set('valid', '获取验证码');
                        localStorage.removeItem('valid_time');

                    } else {
                        self.model.set('valid', sec + '秒');
                        sec--;
                        setTimeout(arguments.callee, 1000);
                    }
                }, 1000);
            }
        },

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                title: '注册',
                valid: '获取验证码',
                back: this.route.query.from || '/login'
            });

            this.loading = new Loading({
                url: '/api/user/register',
                method: 'POST',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if (!res.success)
                        sl.tip(res.msg);
                    else {
                        localStorage.setItem('user', JSON.stringify(res.data));
                        self.back(self.route.query.success || '/');
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });

            this.valid = new Loading({
                url: '/api/user/send_sms',
                method: 'POST',
                params: {
                    mobile: self.model.data.mobile
                },
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if (!res.success) {
                        sl.tip(res.msg)
                    } else {
                        localStorage.setItem('valid_time', Date.now() + 60000);

                        self.validTimeout();
                    }
                }
            });

            self.$valid = this.$('.js_valid');
            self.validTimeout();
        },

        onShow: function () {
            var that = this;
        },

        onDestory: function () {
        }
    });
});
