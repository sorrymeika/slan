var $ = require('$');
var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var bridge = require('bridge');
var Promise = require('promise');
var Event = require('core/event');
var Loader = require('widget/loader');

var friends = require('models/friends');

var TEST_PHONE = /^(134|135|136|137|138|139|147|150|151|152|157|158|159|178|182|183|184|187|188)\d{8}$/;

var contact = Event.mixin({
    newFriends: function () {
        return Http.post('/friends/getNewFriends');
    },

    addFriend: function (user_id, msg) {

        return Http.post('/friends/sendRequest', {
            friend_id: user_id,
            msg: msg
        });
    },

    hideItem: function (fid) {
        return Http.post('/friends/hideItem', {
            fid: fid
        });
    },

    inviteFriend: function (mobile) {
        bridge.system.sendSMS(mobile, "快来加入和生活吧！");
    },

    pageLoaderForSearch: function (model) {
        return Loader.pageLoader({
            url: '/userinfo/search',
            attribute: 'searchResult',
            model: model
        });
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

    getCombinedContacts: function () {
        return Promise.all([this.friends(), this.getCachedContacts()]).then(function (results) {
            results[0].data.forEach(function (item) {
                item.isFriend = true;
            });

            var list = results[0].data;

            results[1].data.forEach(function (item) {

                if (util.indexOf(list, function (newItem) {
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

    getContactList: function (options, process) {
        var self = this;

        if (this.gettingContacts) {
            return;
        }
        this.gettingContacts = true;

        var contactList = friends.getContacts();
        contactList.clear();

        return new Promise(function (resolve, reject) {

            bridge.contact.getContacts(options, function (result) {

                if (result.success) {
                    var data = result.data;
                    var list = [];

                    data.forEach(function (item) {
                        item.phoneNumber = item.phoneNumber.replace(/^\+86|[\s\-]+/g, '');

                        TEST_PHONE.lastIndex = 0;

                        if (TEST_PHONE.test(item.phoneNumber)) {
                            list.push(item);
                        }
                    });

                    contactList.add(list);

                    process(list);
                }

            }, function (result) {

                if (result.success) {

                    resolve(result);

                } else {
                    reject(result);
                }

                self.gettingContacts = false;
            });
        });

    },

    getContactsUser: function (phoneNumbers) {
        phoneNumbers = phoneNumbers.filter(function (item) {
            TEST_PHONE.lastIndex = 0;

            return !!item && TEST_PHONE.test(item);
        });

        if (phoneNumbers.length) {
            return Http.post("/userinfo/contacts", {
                ids: phoneNumbers.join(',')

            }).then(function (res) {
                friends.getContacts().update(res.data, function (a, b) {
                    return a.phoneNumber == b.account;
                });

            }).catch(function () {
            });
        }
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
        return Http.post('/friends/getFriends').then(function (res) {

            friends.getFriends()
                .updateTo(util.map(res.data, ['avatars', 'friends_ext', 'user_id', 'user_name', 'account']), 'user_id');

            return res;
        });
    },

    setFriendMemo: function (friend_id, memo) {
        return Http.post('/friends/setFriendExt', {
            friend_id: friend_id,
            memo: memo
        }).then(function (res) {

            friends.getFriends().update({
                user_id: friend_id,
                friends_ext: {
                    memo: memo
                }
            }, 'user_id')

            return res;
        });
    },

    setPushSwitch: function (friend_id, enable_push) {
        enable_push = !enable_push ? 2 : enable_push;

        return Http.post('/friends/setFriendExt', {
            friend_id: friend_id,
            enable_push: enable_push
        }).then(function (res) {

            friends.getFriends().update({
                user_id: friend_id,
                friends_ext: {
                    enable_push: enable_push
                }
            }, 'user_id')

            return res;
        });
    },

    setLeaveMsgSwitch: function (friend_id, enable_leave_msg) {
        enable_leave_msg = !enable_leave_msg ? 2 : enable_leave_msg;

        return Http.post('/friends/setFriendExt', {
            friend_id: friend_id,
            enable_leave_msg: enable_leave_msg

        }).then(function (res) {

            friends.getFriends().update({
                user_id: friend_id,
                friends_ext: {
                    enable_leave_msg: enable_leave_msg
                }
            }, 'user_id')

            return res;
        });
    },

    friend: function (user_id) {

        return Http.post('/friends/getById', {
            friend_id: user_id

        }).then(function (res) {

            friends.getFriends().update($.extend(res.friend, res.data, {
                friends_ext: res.ext

            }), 'user_id');

            return res;
        });
    },

    deleteFriend: function (friend_id) {

        return Http.post('/friends/deleteFriend', {
            friend_id: friend_id
        });
    },

    clearFriendMessages: function (friend_id) {
        return Http.post('/messages/clearFriendMessages', {
            friend_id: friend_id
        });
    }
});


module.exports = contact;