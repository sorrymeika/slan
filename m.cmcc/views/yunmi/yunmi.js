var $ = require('$');
var util = require('util');
var bridge = require('bridge');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var yunMiRules = require('components/yunMiRules');
var ym = require('logical/yunmi');
var contact = require('logical/contact');
var friendsModel = require('models/friends');

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '云米账户'
        });

        model.back = function() {
            self.back(self.swipeRightBackAction);
        }

        model.seeRules = function() {
            popup.alert({
                className: 'ym_rules__popup',
                title: '云米规则',
                content: yunMiRules.rule,
                btn: '关闭',
                action: function() {}
            })
        }

        model.getShakeYunmi = function(item) {
            if (item.isFriend && item.user_id) {
                if (!item.amount || !item.yunmi_id) {
                    Toast.showToast('该好友暂时没有云米可收！');
                    return;
                }
                popup.popup({
                    className: "bg_0000",
                    tapMaskToHide: true,
                    content: '<div class="ym-redbag2 ps_r"><div click="getYunmi" class="ps_a ta_c cl_fff ym_idx__receive"><i>+</i><em>' + (item.amount / 2) + '</em><span>云米</span></div></div>',
                    getYunmi: function() {
                        var pop = this;
                        loader.showLoading();

                        ym.receiveShakeYunmi(item.yunmi_id).then(function(res) {
                            Toast.showToast("收取成功！");

                            pop.hide();

                            self.getYunmi();

                            model._('shakeResult')
                                .find('yunmi_id', item.yunmi_id)
                                .set({
                                    amount: 0
                                });

                        }).catch(function(e) {
                            Toast.showToast(e.message);

                        }).then(function() {
                            loader.hideLoading();
                        });
                    }
                });

            } else if (item.user_id) {
                self.forward("/contact/person/" + item.user_id);

            } else {
                contact.inviteFriend(item.phoneNumber);
            }
        }

        self.onResult('select_rich_user', function(e, results) {
            var ids = util.map(results, 'user_id');

            return ym.getUsersYunmi(ids.join(',')).then(function(res) {

                if (res.data) {
                    res.data.forEach(function(item) {
                        var first = util.first(results, 'user_id', item.user_id);
                        first.amount = item.amount;
                        first.yunmi_id = item.yunmi_id;
                    });
                }
                model.set({
                    shakeResult: results
                });
            });
        });

        model.findRich = function() {
            self.forward("/yunmi/select_user", {
                type: 2
            });
        }

        model.hideTimeout = function() {
            $(model.refs.timeout).hide();
            $(model.refs.timeoutMask).hide();
        }
        model.receiveYunmi = function() {
            var data = this.get('current');

            if (!data) {
                if (this.get('next')) {
                    $(model.refs.timeout).show();
                    $(model.refs.timeoutMask).show();

                } else {
                    Toast.showToast('暂无云米可以领取！');
                }
                return;
            }

            loader.showLoading();

            ym.receiveYunmi(data.yunmi_id).then(function(res) {
                model.set({
                    current: null,
                    today_amount: model.get('today_amount') + data.amount,
                    amount: model.get('amount') + data.amount
                });

            }).catch(function(e) {
                Toast.showToast(e.message);

            }).then(function() {
                loader.hideLoading();
            });
        }

        var loader = this.loader = new Loader($('body'));

        this.getYunmi();

        this.onResult('refresh_yunmi', function() {
            this.getYunmi();
        });

        self.bindScrollTo(model.refs.main);

        bridge.motion.start();

        this.motion = this.motion.bind(this);
        model.motion = this.motion;
        $(window).on('motion', this.motion);

    },

    onShow: function() {
        var self = this;
    },

    onDestory: function() {
        this.timer && clearInterval(this.timer);
        this.model.destroy();
        $(window).off('motion', this.motion);
        bridge.motion.stop();
    },

    getYunmi: function() {
        var self = this;
        var loader = this.loader;
        var model = this.model;

        loader.showLoading();

        Promise.all([ym.getYunmi(), this.waitLoad()]).then(function(results) {
            var current = results[0].data;
            var next = results[0].next;

            if (next) {
                var serverNow = next.create_date;
                var now = Date.now();

                next.timeFix = now - serverNow;
                next.timeLeft = util.timeLeft(next.start_date - serverNow);

                self.timer = setInterval(function() {
                    var next = model.get('next');
                    var timeLeft = next.start_date - (Date.now() - next.timeFix);

                    if (timeLeft == 0) {
                        if (self.timer) {
                            clearInterval(self.timer);
                            self.timer = null;
                        }
                        self.getYunmi();
                    }

                    timeLeft = util.timeLeft(timeLeft);

                    model.set('next.timeLeft', timeLeft);

                }, 1000);
            }

            model.set({
                amount: results[0].amount,
                today_amount: results[0].today_amount,
                current: current,
                next: next
            });

        }).catch(function(e) {
            Toast.showToast(e.message);

        }).then(function() {
            loader.hideLoading();
        });
    },

    motion: function() {
        var self = this;
        var loader = this.loader;
        var model = this.model;

        if (loader.isLoading) return;

        loader.showLoading();

        contact.getCombinedContacts().then(function(res) {
            var friends = res;
            var shakeResult;

            if (friends.length <= 6) {
                shakeResult = friends;
            } else {
                shakeResult = [];
                for (var i = 6; i > 0; i--) {
                    var index = util.random(friends.length - 1);

                    shakeResult.push(friends.splice(index, 1)[0]);
                }
            }

            var ids = util.map(util.exclude(shakeResult, 'user_id', undefined), 'user_id');

            if (!ids.length) {
                model.set({
                    shakeResult: shakeResult
                });
                return;
            }

            return ym.getUsersYunmi(ids.join(',')).then(function(res) {

                if (res.data) {
                    res.data.forEach(function(item) {
                        var first = util.first(shakeResult, 'user_id', item.user_id);
                        first.amount = item.amount;
                        first.yunmi_id = item.yunmi_id;
                    });
                }

                console.log(shakeResult);

                model.set({
                    shakeResult: shakeResult
                });
            });

        }).catch(function(e) {
            Toast.showToast(e.message);

        }).then(function() {
            loader.hideLoading();
        });


    }
});