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
var yunmiModel = require('models/yunmi');
var contact = require('logical/contact');

var friends = require('models/friends');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '云米账户',
            yunmiData: yunmiModel
        });

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        model.seeRules = function () {
            popup.alert({
                className: 'ym_rules__popup',
                title: '云米规则',
                content: yunMiRules.rule,
                btn: '关闭',
                action: function () { }
            })
        }

        model.getShakeYunmi = function (item) {
            if (item.isFriend && item.user_id) {
                if (!item.amount || !item.yunmi_id) {
                    Toast.showToast('该好友暂时没有云米可收！');
                    return;
                }
                popup.popup({
                    className: "bg_0000",
                    tapMaskToHide: true,
                    content: '<div class="ym-redbag2 ps_r"><div click="getYunmi" class="ps_a ta_c cl_fff ym_idx__receive"><i>+</i><em>' + (item.amount / 2) + '</em><span>云米</span></div></div>',
                    getYunmi: function () {
                        var pop = this;
                        loader.showLoading();

                        ym.receiveShakeYunmi(item.yunmi_id).then(function (res) {
                            Toast.showToast("收取成功！");

                            pop.hide();

                            self.getYunmi();

                            model._('shakeResult')
                                .find('yunmi_id', item.yunmi_id)
                                .set({
                                    amount: 0
                                });

                        }).catch(function (e) {
                            Toast.showToast(e.message);

                        }).then(function () {
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

        self.onResult('select_rich_user', function (e, results) {
            var ids = util.map(results, 'user_id');

            return ym.getUsersYunmi(ids.join(',')).then(function (res) {

                if (res.data) {
                    res.data.forEach(function (item) {
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

        model.findRich = function () {
            self.forward("/yunmi/select_user", {
                type: 2
            });
        }

        model.hideTimeout = function () {
            $(model.refs.timeout).hide();
            $(model.refs.timeoutMask).hide();
        }
        model.receiveYunmi = function () {
            var data = this.get('current');

            if (!data) {
                if (this.get('next.yunmi_id')) {
                    $(model.refs.timeout).show();
                    $(model.refs.timeoutMask).show();

                } else {
                    Toast.showToast('暂无云米可以领取！');
                }
                return;
            }

            loader.showLoading();

            ym.receiveYunmi(data.yunmi_id).then(function (res) {
                yunmiModel.set({
                    amount: yunmiModel.get('amount') + data.amount
                })

                model.set({
                    current: null,
                    today_get_amount: model.get('today_get_amount') + data.amount,
                });

            }).catch(function (e) {
                Toast.showToast(e.message);

            }).then(function () {
                loader.hideLoading();
            });
        }

        var loader = this.loader = new Loader($('body'));

        this.getYunmi();

        this.onResult('refresh_yunmi', function () {
            this.getYunmi();
        });

        self.bindScrollTo(model.refs.main);

        bridge.motion.start();

        this.motion = this.motion.bind(this);
        model.motion = this.motion;
        $(window).on('motion', this.motion);

    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
        this.timer && clearInterval(this.timer);
        this.model.destroy();
        $(window).off('motion', this.motion);
        bridge.motion.stop();
    },

    getYunmi: function () {
        var self = this;
        var loader = this.loader;
        var model = this.model;

        loader.showLoading();

        Promise.all([ym.getYunmi(), this.waitLoad()]).then(function (results) {
            var current = results[0].data;
            var next = results[0].next;

            if (next) {
                var serverNow = next.create_date;
                var now = Date.now();

                next.timeFix = now - serverNow;
                next.timeLeft = util.timeLeft(next.start_date - serverNow);

                self.timer = setInterval(function () {
                    var next = model.get('next');
                    var timeLeft = next.start_date - (Date.now() - next.timeFix);

                    if (timeLeft <= 0) {
                        if (self.timer) {
                            clearInterval(self.timer);
                            self.timer = null;
                        }
                        self.getYunmi();
                        model.hideTimeout();
                        return;
                    }

                    timeLeft = util.timeLeft(timeLeft);

                    model.set('next.timeLeft', timeLeft);

                }, 1000);
            }

            yunmiModel.set({
                amount: results[0].amount
            })

            model.set({
                today_get_amount: results[0].today_get_amount,
                current: current,
                next: next
            });

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    motion: function () {
        var self = this;
        var loader = this.loader;
        var model = this.model;

        if (loader.isLoading) return;

        loader.showLoading();

        var friendsCollection = friends.getFriends();
        var size = Math.min(util.random(3, 6), friendsCollection.size());
        var tmp = [];
        var shakeResult = [];

        for (var i = friendsCollection.size() - 1; i >= 0; i--) {
            tmp.push(i);
        }

        for (var i = size; i > 0; i--) {
            var index = util.random(tmp.length - 1);
            index = tmp.splice(index, 1)[0];

            shakeResult.push(friendsCollection._(index).set({
                isFriend: true
            }));
        }

        model.set({
            shakeResult: shakeResult
        });

        shakeResult = model._('shakeResult');

        var updateShakeYunmi = function (ids) {
            if (ids.length) {

                ym.getUsersYunmi(ids.filter(function (id) {
                    return id;

                }).join(',')).then(function (res) {

                    shakeResult.update(res.data.map(function (item) {
                        return {
                            user_id: item.user_id,
                            amount: item.amount,
                            yunmi_id: item.yunmi_id
                        }

                    }), 'user_id');
                }).catch(function (e) {
                    Toast.showToast(e.message);

                }).then(function () {
                    loader.hideLoading();
                });

            } else {
                loader.hideLoading();
            }
        }

        var left = 6 - size;

        if (left > 0) {

            var randomContacts = function () {
                var tmp = [];
                var contactsCollection = friends.getContacts();
                var phoneNumbers = [];

                for (var i = contactsCollection.size() - 1; i >= 0; i--) {
                    tmp.push(i);
                }

                for (var i = left; i > 0 && tmp.length;) {
                    var index = util.random(tmp.length - 1);
                    index = tmp.splice(index, 1)[0];

                    var contactMod = contactsCollection._(index);

                    if (contactMod) {
                        if (-1 == friendsCollection.indexOf('account', contactMod.get('phoneNumber'))) {

                            phoneNumbers.push(contactMod.get('phoneNumber'));
                            shakeResult.add(contactMod);

                            i--;
                        }
                    }
                }

                var psm = Promise.resolve();

                if (phoneNumbers.length) {
                    psm = psm.then(function () {
                        return contact.getContactsUser(phoneNumbers);
                    });
                }
                psm.then(function () {
                    updateShakeYunmi(shakeResult.map('user_id'))
                });
            }

            if (friends.getContacts().size() == 0) {
                contact.getContactList({
                    size: 50

                }).then(function () {

                    randomContacts();

                }, function () {
                    updateShakeYunmi(shakeResult.map('user_id'));
                });

            } else {
                randomContacts();
            }

        } else {
            updateShakeYunmi(shakeResult.map('user_id'));
        }

    }
});