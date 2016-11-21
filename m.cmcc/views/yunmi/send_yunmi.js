var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var ym = require('logical/yunmi');
var chat = require('logical/chat');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '赠云米'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.sendYunmi = function () {
            var memo = this.get('memo');
            var amount = this.get('send_amount');
            var mobile = this.get('mobile');

            if (!util.validateMobile(mobile)) {
                Toast.showToast("请填写手机号");
                return;
            }

            if (!amount) {
                Toast.showToast("请填写赠送数量");
                return;
            } else if (!/^\d+$/.test(amount)) {
                Toast.showToast("请填写正确的赠送数量");
                return;
            }
            loader.showLoading();

            ym.sendYunmi(mobile, amount, memo).then(function (res) {
                chat.record(true, res.friend_id, {
                    type: chat.MESSAGETYPE.SEND_YUNMI,
                    content: memo
                });

                self.setResult('refresh_yunmi');
                model.back();

            }).catch(function (e) {
                Toast.showToast(e.message);

            }).then(function () {
                loader.hideLoading();
            });
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([ym.getTotalYunmi(), this.waitLoad()]).then(function (results) {

            model.set({
                amount: results[0].amount
            });

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
