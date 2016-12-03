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
var friends = require('models/friends');


module.exports = Activity.extend({

    onCreate: function() {
        var self = this;
        var type = this.route.query.type;
        var personId = this.route.params.id;

        var firend = friends.getFriend(personId);

        console.log(firend);

        var model = this.model = new Model(this.$el, {
            title: '详细资料',
            personId: personId,
            person: firend
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        model.deleteFriend = function() {

            popup.confirm({
                title: '温馨提示',
                content: '删除好友，同时删除与该好友的聊天记录？',
                confirmText: '删除',
                confirmAction: function() {
                    this.hide();

                    contact.deleteFriend(personId);
                }
            });
        }

        model.clearHistory = function() {

            popup.confirm({
                title: '温馨提示',
                content: '确定删除与该好友的聊天记录？',
                confirmText: '删除',
                confirmAction: function() {
                    this.hide();
                }
            });
        }

        model.toMemo = function() {
            self.forward('/contact/memo/' + personId)
        }

        model.openPhoneCall = function() {
            bridge.system.openPhoneCall(this.get('person.account'));
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([contact.friend(personId), this.waitLoad()]).then(function(results) {
            var res = results[0];

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