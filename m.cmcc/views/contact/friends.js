var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
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
            title: '我的好友',
            letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(''),
            friendList: friends._('friends')
        });

        model.delegate = this;

        model.groups = this.groups.bind(this);

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([contact.friends(), this.waitLoad()]).then(function (results) {

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

    onDestroy: function () {
        this.model.destroy();
    },

    phoneCall: function (phoneNumber) {
        bridge.system.phoneCall(phoneNumber);
        return false;
    },

    sendSms: function (phoneNumber) {
        bridge.system.sendSMS(phoneNumber, "");
        return false;
    },

    groups: function () {
        var model = this.model;
        var groups = {};
        var data = model.data.friendList;

        if (!data || !data.length) return [];

        console.log(data);

        data.forEach(function (item) {
            var letter = firstLetter(item.user_name).charAt(0).toUpperCase();

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

        return groups;
    }
});