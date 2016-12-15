var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var bridge = require('bridge');

var auth = require('logical/auth');
var Http = require('core/http');

module.exports = Activity.extend({
    defBackUrl: null,

    onCreate: function () {
        var self = this;

        self.swipeRightBackAction = null;

        var model = this.model = new Model(this.$el, {
            smsTime: 0
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.login = function () {
            if (!this.get('agree')) {
                Toast.showToast('请先同意《八闽生活用户使用协议》！');
                return;
            }
            var phoneNo = this.data.phoneNo;
            var password = this.data.password;

            if (!phoneNo) {
                Toast.showToast('请填写手机号！');
                return;
            }

            if (!password) {
                Toast.showToast('请填写验证码！');
                return;
            }

            Loader.showLoading();

            bridge.cmcc.login(phoneNo, password, "sms", function (res) {
                if (res.success) {

                    new Http({
                        url: '/user/login',
                        params: auth.encryptParams({
                            account: phoneNo,
                            password: auth.md5(password),
                            token: res.token
                        })

                    }).request()
                        .then(function (res) {
                            auth.setAuthToken(res.data.tk);

                            delete res.data.tk;

                            auth.setUser(res.data);

                            self.back('/');

                        }).catch(function (e) {
                            Toast.showToast(e.message);

                        }).then(function () {
                            Loader.hideLoading();
                        });

                } else {
                    Toast.showToast(res.message);
                    Loader.hideLoading();
                }
            });
        }

        model.sendSms = function () {
            if (this.data.smsTime > 0) return;

            var phoneNo = this.data.phoneNo;

            if (!phoneNo) {
                Toast.showToast('请填写手机号！');
                return;
            }

            bridge.cmcc.sendSms(phoneNo, "smsLogin");

            this.leftTime = Date.now() + 60 * 1000;

            this.timer = setInterval(function () {

                var left = Math.round((model.leftTime - Date.now()) / 1000);

                if (left <= 0) {
                    clearInterval(model.timer)
                    model.set({
                        smsTime: 0
                    })
                } else {
                    model.set({
                        smsTime: left
                    })
                }

            }, 1000)

            this.set({
                smsTime: 59
            })
        }

        var loader = this.loader = new Loader(this.$el);

        self.bindScrollTo(model.refs.main);

        this.onResult('agree_licence', function () {
            model.set('agree', true);
        });

    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});