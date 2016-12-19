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

    onCreate: function() {
        var self = this;
        var type = this.route.query.type;
        var personId = this.route.params.id;

        var model = this.model = new Model(this.$el, {
            title: '详细资料',
            user: user
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        model.addFriend = function() {

            if (true) {
                self.forward('/friend/valid/' + personId);

            } else {
                contact.addFriend(personId).then(function() {
                    Toast.showToast('发送成功');

                    contact.trigger('addFriend');

                    model.back();

                }).catch(function(e) {
                    Toast.showToast(e.message);
                });
            }

        }

        model.acceptFriend = function() {
            contact.acceptFriend(personId).then(function() {
                contact.trigger('acceptFriend', personId);

                self.forward("/contact/chat/" + personId + "?from=/contact/new");

            }).catch(function(e) {
                Toast.showToast(e.message);

            });
        }

        model.rejectFriend = function() {
            contact.rejectFriend(personId).then(function() {
                contact.trigger('rejectFriend', personId);

                self.back();

            }).catch(function(e) {
                Toast.showToast(e.message);
            });
        }

        model.openPhoneCall = function() {
            bridge.system.openPhoneCall(this.get('person.account'));
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([contact.person(personId), this.waitLoad()]).then(function(results) {

            model.set({
                person: results[0].data
            })

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

    onDestroy: function() {
        this.model.destroy();
    }
});