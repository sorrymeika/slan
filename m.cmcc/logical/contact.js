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

    personStatus: function (user_id) {
        return Http.post('/userinfo/getStatus', {
            user_id: user_id
        });
    },

    contactList: function () {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: [{
                            user_id: 1,
                            user_name: '用户a',
                            avatars: 'images/logo.png',
                            phoneNumber: '18830493332',
                            contactName: '小王',
                            contactImage: 'images/logo.png',
                            contactId: 1,
                            //-2非好友,-1未处理,0拒绝,1接受,2删除
                            status: -1
                        }, {
                            user_id: 1,
                            user_name: '用户b',
                            avatars: 'images/logo.png',
                            phoneNumber: '18830493332',
                            contactName: '有王',
                            contactImage: 'images/logo.png',
                            contactId: 1,
                            //-2非好友,-1未处理,0拒绝,1接受,2删除
                            status: 1
                        }, {
                            user_id: 0,
                            user_name: null,
                            contactName: '小张',
                            contactImage: 'images/logo.png'
                        }, {
                            user_id: 0,
                            user_name: null,
                            contactName: '王队',
                            contactImage: 'images/logo.png'
                        }]
                    });
                }, 100)
            });


        bridge.contact.getAll(function (contactList) {

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