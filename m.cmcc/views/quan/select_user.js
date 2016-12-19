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

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;
        var routeData = this.route.data;

        var model = this.model = new Model(this.$el, {
            title: '我的好友',
            friends: routeData.friends || [],
            type: routeData.type
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        model.save = function() {

            var groups = this.get('groups');
            var friends = [];

            groups.forEach(function(group) {
                friends = friends.concat(util.filter(group.list, 'checked', true));
            });

            routeData.onSelect(friends);
            this.back();
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([contact.getFriends(), this.waitLoad()]).then(function(results) {

            var friendList = results[0].data;
            var selected = model.get('friends');

            friendList.forEach(function(item) {
                if (-1 != util.indexOf(selected, 'user_id', item.user_id)) item.checked = true;
            });

            model.set({
                friendList: friendList,
                groups: self.groups(friendList)
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

    onDestroy: function() {
        this.model.destroy();
    },

    groups: function(data) {
        var groups = {};

        if (!data) return;

        data.forEach(function(item) {

            var letter = firstLetter(item.user_name).charAt(0).toUpperCase();

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

        return groups;
    }
});