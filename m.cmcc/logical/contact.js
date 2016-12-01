var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var bridge = require('bridge');
var Promise = require('promise');
var Event = require('core/event');
var Loader = require('widget/loader');

var friends = require('models/friends');

var contact = Event.mixin({
    newFriends: function() {
        return Http.post('/friends/getNewFriends');
    },

    addFriend: function(user_id, msg) {

        return Http.post('/friends/sendRequest', {
            friend_id: user_id,
            msg: msg
        });
    },

    hideItem: function(fid) {
        return Http.post('/friends/hideItem', {
            fid: fid
        });
    },

    inviteFriend: function(mobile) {
        bridge.system.sendSMS(mobile, "快来加入和生活吧！");
    },

    pageLoaderForSearch: function(model) {
        return Loader.pageLoader('/userinfo/search', 'searchResult', model);
    },

    person: function(user_id) {
        return Http.post('/userinfo/getById', {
            user_id: user_id
        });
    },

    isFriend: function(user_id) {
        return Http.post('/userinfo/isFriend', {
            user_id: user_id
        });
    },

    getCombinedContacts: function() {
        return Promise.all([this.friends(), this.getCachedContacts()]).then(function(results) {
            results[0].data.forEach(function(item) {
                item.isFriend = true;
            });

            var list = results[0].data;

            results[1].data.forEach(function(item) {

                if (util.indexOf(list, function(newItem) {
                        if (item.user_id && !newItem.user_id || newItem.user_id && !item.user_id) return false;
                        else if (!item.user_id && !newItem.user_id) return item.phoneNumber == newItem.phoneNumber;
                        return item.user_id == newItem.user_id;

                    }) == -1) {

                    list.push(item);
                }
            });

            return list;
        });
    },

    getCachedContacts: function() {
        var cached = friends.getContacts();

        if (cached.size() == 0) {
            return this.contactList();
        } else {
            return new Promise(function(resolve, reject) {

                resolve({
                    success: true,
                    data: cached.getAll()
                });
            });
        }
    },

    contactList: function() {
        return new Promise(function(resolve, reject) {

            bridge.contact.getContacts(function(result) {

                if (result.success) {
                    var data = result.data;
                    var ids = [];

                    data.forEach(function(item) {
                        if (/^1\d{10}$/.test(item.phoneNumber)) {
                            ids.push(item.phoneNumber);
                        }
                    });

                    if (ids.length) {
                        Http.post("/userinfo/contacts", {
                            ids: ids.join(',')

                        }).then(function(res) {
                            data.forEach(function(item) {
                                var userinfo = util.first(res.data, 'account', item.phoneNumber);
                                userinfo && Object.assign(item, userinfo);
                            });

                            friends.getContacts().set(data);

                            resolve({
                                success: true,
                                data: data
                            });
                        }, reject);

                    } else {
                        resolve({
                            success: true,
                            data: []
                        });
                    }


                } else {
                    reject(result);
                }

            });

        });

    },

    backup: function() {

        return new Promise(function(resolve, reject) {

            bridge.contact.getContacts(function(result) {
                if (result.success) {
                    resolve(result);
                } else {
                    reject(result);
                }
                Http.post('/contact_backup/backup', {
                    data: JSON.stringify(result.data)
                });

            });

        });

    },

    acceptFriend: function(user_id) {

        return Http.post('/friends/accept', {
            friend_id: user_id
        });
    },

    rejectFriend: function(user_id) {

        if (sl.isDev)
            return new Promise(function(resolve, reject) {

                setTimeout(function() {
                    resolve({
                        success: true
                    });
                }, 100)
            });

        return Http.post('/contact/rejectFriend', {
            user_id: user_id
        });
    },

    getCachedFriends: function() {
        var cached = friends.getFriends();

        if (cached.size() == 0) {
            return this.friends();
        } else {
            return new Promise(function(resolve, reject) {

                resolve({
                    success: true,
                    data: cached.getAll()
                });
            });
        }

    },

    friends: function() {
        return Http.post('/friends/getFriends').then(function(res) {

            friends.getFriends().set(res.data);

            return res;
        });
    },

    setFriendMemo: function(friend_id, memo) {
        return Http.post('/friends/setFriendMemo', {
            friend_id: friend_id,
            memo: memo
        });
    },

    friend: function(user_id) {

        return Http.post('/friends/getById', {
            friend_id: user_id
        });
    },

    deleteFriend: function(user_id) {

        return Http.post('/contact/deleteFriend', {
            user_id: user_id
        });
    }
});


module.exports = contact;