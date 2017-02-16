var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var contact = require('logical/contact');
var user = require('models/user');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var type = this.route.query.type;
        var personId = this.route.params.id;

        var model = this.model = new Model(this.$el, {
            title: '详细资料',
            user: user
        });

        model.delegate = this;

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.acceptFriend = function () {
            contact.acceptFriend(personId).then(function () {
                contact.trigger('acceptFriend', personId);
                // self.forward("/contact/chat/" + personId + "?from=/contact/new");

                self.replaceWith('/contact/friend/' + personId)
                    .forward('/contact/memo/' + personId);

            }).catch(function (e) {

                Toast.showToast(e.message);
            });
        }

        model.rejectFriend = function () {
            contact.rejectFriend(personId).then(function () {
                contact.trigger('rejectFriend', personId);

                self.back();

            }).catch(function (e) {
                Toast.showToast(e.message);
            });
        }

        model.openPhoneCall = function () {
            if (this.get('canCallMe') == 1)
                bridge.system.openPhoneCall(this.get('person.account'));
            else
                Toast.showToast('对方未允许陌生人拨号，请先加好友');
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([contact.person(personId), this.waitLoad()]).then(function (results) {

            var res = results[0];

            model.set({
                person: res.data,
                canCallMe: res.can_call_me,
                validNewFriend: res.valid_new_friend
            })

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    addFriend: function () {
        var self = this;
        var model = this.model;
        var personId = this.route.params.id;

        if (model.get('validNewFriend') != 2) {

            self.forward('/friend/valid/' + personId);

        } else {
            contact.addFriend(personId).then(function () {
                Toast.showToast('添加好友成功');

                contact.trigger('addFriend');

                self.replaceWith('/contact/friend/' + personId)
                    .forward('/contact/memo/' + personId);

            }).catch(function (e) {
                Toast.showToast(e.message);
            });
        }

    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
        this.model.destroy();
    }
});