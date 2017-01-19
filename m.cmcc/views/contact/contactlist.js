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

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '手机通讯录查询'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }
        model.getUserShowName = friends.getUserShowName;

        model.inviteFriend = function (phoneNumber) {
            contact.inviteFriend(phoneNumber);
        }

        var loader = this.loader = new Loader(this.$el);

        var contactList = this.contactList = friends.getContacts();

        this.setGroups = this.setGroups.bind(this);

        friends.observe('contacts', this.setGroups);

        contact.getContactList({}, function (data) {
            contact.getContactsUser(util.map(util.filter(data, 'user_id', undefined), 'phoneNumber'))
        });

        self.bindScrollTo(model.refs.main);
    },

    onShow: function () {
        var self = this;
    },

    setGroups: function () {
        var groups = {};
        var data = this.contactList.get();

        data.forEach(function (item) {
            var letter = firstLetter(item.contactName).charAt(0).toUpperCase();

            if (!groups[letter]) {
                groups[letter] = [];
            }

            groups[letter].push(item);
        });

        groups = Object.keys(groups).map(function (key) {

            return {
                letter: key,
                list: groups[key]
            };
        });

        groups.sort(function (a, b) {
            return a.letter == b.letter ? 0 : a.letter > b.letter ? 1 : -1;
        });

        this.model.set({
            groups: groups
        });
    },

    onDestroy: function () {
        friends.removeObserve('contacts', this.setGroups);
        this.model.destroy();
    }
});