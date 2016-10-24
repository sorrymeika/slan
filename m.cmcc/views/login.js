var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var bridge = require('bridge');

var aes = require('util/aes');


var key = aes.genKey();

console.log(key);

var en = aes.encrypt(key, '我们');

var de = aes.decrypt(key, en);

console.log(en, 'de:', de);


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            smsTime: 0
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.login = function () {
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

            bridge.cmcc.login(phoneNo, password, "sms", function (res) {
                if (res.success) {
                    model.back();

                } else {
                    Toast.showToast(res.message);
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
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
