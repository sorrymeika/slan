var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var firstLetter = require('utils/firstLetter');

var contact = require('logical/contact');

var friends = require('models/friends');

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '手机通讯录查询'
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }
        model.getUserShowName = friends.getUserShowName;

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        var today = util.formatDate(new Date(), 'yyyyMMdd');
        var hasGetToday = util.store('hasGetContactListToday') == today;

        Promise.all([hasGetToday ? null : contact.contactList(), this.waitLoad()]).then(function(results) {
            util.store('hasGetContactListToday', today);

            var contactList = friends.getContacts();

            Promise.resolve(contact.getContactsUser(util.map(util.filter(contactList.data, 'user_id', undefined), 'phoneNumber')))
                .then(function() {
                    var data = contactList.get();
                    var groups = {};

                    console.log(data);

                    data.forEach(function(item) {
                        var letter = firstLetter(item.contactName).charAt(0).toUpperCase();

                        if (!groups[letter]) {
                            groups[letter] = [];
                        }

                        groups[letter].push(item);
                    });

                    groups = Object.keys(groups).map(function(key) {

                        return {
                            letter: key,
                            list: groups[key]
                        };
                    });

                    model.set({
                        groups: groups
                    });

                    self.bindScrollTo(model.refs.main);
                });



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