var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var bridge = require('bridge');
var Promise = require('promise');
var Event = require('core/event');
var Loader = require('widget/loader');

var contact = Event.mixin({
    newFriends: function () {
        return Http.post('/friends/getNewFriends');
    },

    addFriend: function (user_id) {

        return Http.post('/friends/sendRequest', {
            friend_id: user_id
        });
    },

    hideItem: function (fid) {
        return Http.post('/friends/hideItem', {
            fid: fid
        });
    },

    pageLoaderForSearch: function (model) {
        return Loader.pageLoader('/userinfo/search', 'searchResult', model);
    },

    person: function (user_id) {
        return Http.post('/userinfo/getById', {
            user_id: user_id
        });
    },

    isFriend: function (user_id) {
        return Http.post('/userinfo/isFriend', {
            user_id: user_id
        });
    },

    contactList: function () {
        return new Promise(function (resolve, reject) {

            bridge.contact.getContacts(function (result) {

                if (result.success) {
                    var data = result.data;
                    var ids = [];

                    data.forEach(function (item) {
                        if (/^1\d{10}$/.test(item.phoneNumber)) {
                            ids.push(item.phoneNumber);
                        }
                    });

                    Http.post("/userinfo/contacts", {
                        ids: ids.join(',')

                    }).then(function (res) {
                        data.forEach(function (item) {
                            var userinfo = util.first(res.data, 'account', item.phoneNumber);
                            userinfo && Object.assign(item, userinfo);
                        });
                        resolve({
                            success: true,
                            data: data
                        });
                    }, reject);

                } else {
                    reject(result);
                }

            });

        });

    },

    backup: function () {

        return new Promise(function (resolve, reject) {

            bridge.contact.getContacts(function (result) {
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

    acceptFriend: function (user_id) {

        return Http.post('/friends/accept', {
            friend_id: user_id
        });
    },

    rejectFriend: function (user_id) {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true
                    });
                }, 100)
            });

        return Http.post('/contact/rejectFriend', {
            user_id: user_id
        });
    },

    friends: function () {
        return Http.post('/friends/getFriends');
    },

    setFriendMemo: function (friend_id, memo) {
        return Http.post('/friends/setFriendMemo', {
            friend_id: friend_id,
            memo: memo
        });
    },

    friend: function (user_id) {

        return Http.post('/friends/getById', {
            friend_id: user_id
        });
    },

    deleteFriend: function (user_id) {

        return Http.post('/contact/deleteFriend', {
            user_id: user_id
        });
    }
});


module.exports = contact;