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

    onCreate: function() {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '云米红包',
            type: 1,
            friends: []
        });

        this.onResult('select_redbag_user', function(e, friends) {
            model._('friends').set(friends);
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        model.selectFriends = function() {
            self.forward("/yunmi/select_user", {
                type: 1,
                friends: model._('friends')
            });
        }

        model.sendRedbag = function() {
            var memo = this.get('memo') || "恭喜发财，大吉大利！";
            var amount = this.get('send_amount');
            var qty = this.get('qty');
            var friends = this.get('friends');

            if (!amount) {
                Toast.showToast("请填写云米金额");
                return;
            } else if (!/^\d+$/.test(amount)) {
                Toast.showToast("请填写正确的云米金额");
                return;
            }

            if (!qty) {
                Toast.showToast("请填写云米数量");
                return;
            } else if (!/^\d+$/.test(qty)) {
                Toast.showToast("请填写正确的云米数量");
                return;
            } else if (parseInt(qty) > 100) {
                Toast.showToast("红包数量上限100个");
                return;
            }

            if (!friends.length) {
                Toast.showToast("请选择接收红包的好友！");
                return;
            }

            loader.showLoading();

            ym.sendRedbag({
                quantity: qty,
                amount: amount,
                type: model.get('type'),
                friends: friends.map(function(friend) {
                    return friend.user_id;
                }).join(',')

            }).then(function(res) {
                friends.forEach(function(friend) {
                    chat.record(true, friend.friend_id, {
                        type: chat.MESSAGETYPE.YUNMI_REDBAG,
                        content: memo
                    });
                });

                self.setResult('refresh_yunmi');
                model.back();

            }).catch(function(e) {
                Toast.showToast(e.message);

            }).then(function() {
                loader.hideLoading();
            });
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([ym.getTotalYunmi(), this.waitLoad()]).then(function(results) {
            model.set({
                amount: results[0].amount
            });

            self.bindScrollTo(model.refs.main);

        }).catch(function(e) {
            Toast.showToast(e.message);

        }).then(function() {
            loader.hideLoading();
        });
    },

    onShow: function() {
        var self = this;

    },

    onDestory: function() {
        this.model.destroy();
    }
});