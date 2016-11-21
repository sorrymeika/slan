var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var ym = require('logical/yunmi');
var userModel = require('models/user');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var trade_id = this.route.params.id;
        var user_id = userModel.get('user_id');

        var loader = this.loader = new Loader(this.$el);

        var model = this.model = new Model(this.$el, {
            title: ''
        });

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        model.receive = function () {
            loader.showLoading();

            if (this.get('type') == 1) {
                ym.receiveRedbag(this.get('redbag_id')).catch(function (e) {
                    Toast.showToast(e.message);
                    self.load();

                }).then(function () {
                    loader.hideLoading();
                });
            } else {
                ym.receiveSend(trade_id).catch(function (e) {
                    Toast.showToast(e.message);
                    self.load();

                }).then(function () {
                    loader.hideLoading();
                });
            }
        }

        self.bindScrollTo(model.refs.main);

        this.load();
    },

    load: function () {
        var self = this;

        var model = this.model;
        var loader = this.loader;
        var trade_id = this.route.params.id;
        var user_id = userModel.get('user_id');

        loader.showLoading();

        Promise.all([ym.getTrade(trade_id), this.waitLoad()]).then(function (results) {
            var trade = results[0].data;

            switch (trade.trade_type) {
                //发红包
                case 6:
                    var details = results[0].redbag_details;
                    var amount = -1;
                    var receive_id = 0;
                    details.forEach(function (item) {
                        if (item.friend_id == user_id) {
                            amount = item.amount;

                        } else if (!receive_id && item.status == 2) {
                            receive_id = item.receive_id;
                        }
                    });

                    if (amount == -1 && receive_id) {
                        amount = 0;
                    }

                    model.set({
                        status: amount > 0 ? 1 : amount,
                        title: '和生活红包',
                        icon: 'ym-redbag3',
                        type: 1,
                        redbag_id: results[0].redbag.redbag_id,
                        amount: amount,
                        date: trade.trade_date,
                        memo: trade.memo || '恭喜发财，大吉大利！'
                    });
                    break;

                case 4:
                    var receive_yunmi = results[0].receive_yunmi;

                    if (receive_yunmi) {
                        model.set({
                            status: 1
                        });
                    } else {
                        model.set({
                            status: 0
                        });
                    }

                    model.set({
                        amount: trade.amount,
                        title: '转账',
                        date: trade.trade_date,
                        type: 2,
                        icon: 'ym-wait'
                    });
                    break;
            }


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
