var vm = require('core/model2');
var util = require('util');
var $ = require('$');
var messagesList = require('./messagesList');
var user = require('./user');

var friends = vm.createModel({
    defaultData: {
        contacts: [],
        friends: util.store('friends') || [],
        newFriendsCount: util.store('newFriendsCount') || 0
    },
    getFriends: function() {
        return this._('friends');
    },

    getFriend: function(user_id) {
        var list = this.getFriends();
        var firend = list.find('user_id', user_id);

        if (!firend) {
            firend = list.add({
                user_id: user_id
            });
        }
        return firend;
    },

    getContacts: function() {
        return this._('contacts');
    },

    getUserShowName: function(item) {

        console.log(item);

        if (item.user_id == user.get('user_id')) return item.user_name || ('用户' + item.user_id);

        var friend = friends.getFriend(item.user_id);

        return friend == null ? (item.user_name || ('用户' + item.user_id)) : friend.get('name_for_show');
    },

    addNewFriendsCount: function() {

        return this.set({
            newFriendsCount: this.data.newFriendsCount + 1
        });
    }
});

friends.observe('friends', function(e) {
    var data = this.get('friends');
    var changed = [];
    var name_for_show;

    data.forEach(function(item) {
        name_for_show = (item.friends_ext ? (item.friends_ext.memo || item.user_name) : item.user_name) || ('用户' + item.user_id);
        if (item.name_for_show != name_for_show) {
            changed.push({
                user_id: item.user_id,
                name_for_show: (item.name_for_show = name_for_show)
            });
        }
    });

    if (changed.length) {
        this._('friends').update(changed, 'user_id');
    }

    messagesList.getList().update(data.map(function(item) {
        return {
            user_id: item.user_id,
            avatars: item.avatars,
            user_name: item.name_for_show
        }
    }), 'user_id', false);

    util.store('friends', data);
});

friends.observe('contacts', function(e) {
    util.store('contacts', this._('contacts').data);
});


friends.on('change:newFriendsCount', function(e, count) {
    util.store('newFriendsCount', count);
});

module.exports = friends;