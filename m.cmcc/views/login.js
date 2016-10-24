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
var RSA = require('util/rsa');

var rsa = new RSA();


var res = rsa.setPrivateKey("MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCczoLxjmckSX9oJBNSXY1rKWK5\
urp3WzPiLhctBOahVSaSeWhVKif1Q1VSfDhnEw93pNRX6vxwsZ215x8iAFU/Xp8q\
Pdj+S3mVjefkHZQRBohnJ1Bs7qGf+794yKOXyeUOUXqMbeIBuZu7MmZkNcnjLU8r\
Y9SWbWtJmH6pjEYS5QIDAQAB")
    .encrypt("asdfafsasdf我们都是白痴asdfasfaf");

console.log(res);

rsa.setPrivateKey("MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAJzOgvGOZyRJf2gk\n" +
    "E1JdjWspYrm6undbM+IuFy0E5qFVJpJ5aFUqJ/VDVVJ8OGcTD3ek1Ffq/HCxnbXn\n" +
    "HyIAVT9enyo92P5LeZWN5+QdlBEGiGcnUGzuoZ/7v3jIo5fJ5Q5Reoxt4gG5m7sy\n" +
    "ZmQ1yeMtTytj1JZta0mYfqmMRhLlAgMBAAECgYBtYJdyC1TiuOnIKLHZmCwW/c1B\n" +
    "pICA1PtB38iGvI5rJsw7C7i8/yTULd2MJd3p+B+n4y/DC8R+j0ZlJgxPWVAcRk6g\n" +
    "ATUEgWR6w3+QNgUg6Y7sjixK50Fn3EuzeO1CkS7KMjtr1wCiSPJraqZ4LiDvVLSx\n" +
    "XW0mxjdAm2eJefWtmQJBAMkXY0qi4uqp7Bzlb51acCY4Uz8JlNOrQUlp5jXTEj0H\n" +
    "atBX9+Npl5ttdfmHaqvRX+IyvQXQZ3SYDM7ybpoYcBcCQQDHn42bS9kPbQtdIKyr\n" +
    "65eh35KKVkWWqllJ5WTZ7k41Tqafn7IhDXrxV8l6UErb+40VkxhwjLBWGWPcVFki\n" +
    "DVZjAkAhiYcDwZq6rFA2mYU95wFhPm+TydNKYftndQPx4hvelcgYqzMqeEfSojTU\n" +
    "wuLleOvW28Nuns1CQsGQGhqcFItNAkAIbNV/Lm5U1ldacNyYzPKzZEo9CHMbbskh\n" +
    "80qUYBhw64bgyc6s0nLT6M6aGPVv32gO9wxbA7UVjTDHxc+VPlbdAkEAjSNLv/9P\n" +
    "nI6RPwVR7PGvVc8q4MxkllNEQKUjPqlwJCpqC9nUe9DK2E3WCbcgp14Q/IFj/S7U\n" +
    "kSYYIKcoCLQR3A==");

var res = rsa.decrypt("Y7rxqtfcQzAbQ+ZVNUASxRcui2NVvSdZo/Jprdxy6xLjcp2qF2WHovwYgixYAXhz7Yf+7t/EuIFfKZiE4AmJ4ITPwS9nTY8ZL+bCUXHeieNbMakvYs96r6DQHwwcCaSlix202Q4qN4nSsJ2IQAkCeAsciJgUfFV+Lp5Mh3pipx4=");
console.log(res);

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
