var util = require('util');
var vm = require('core/model2');
var bridge = require('bridge');
var Promise = require('promise');
var Event = require('core/event');

if (!util.store('friends_list')) {

    util.store('friends_list', [{
        user_id: 1,
        user_name: '小王',
        avatars: 'images/logo.png',
        //-2非好友,-1未处理,0拒绝,1接受,2删除
        status: 1
    }, {
        user_id: 1,
        user_name: '用户b',
        avatars: 'images/logo.png',
        //-2非好友,-1未处理,0拒绝,1接受,2删除
        status: 1
    }, {
        user_id: 3,
        user_name: '小张',
        avatars: 'images/logo.png',
        //-2非好友,-1未处理,0拒绝,1接受,2删除
        status: 1
    }, {
        user_id: 5,
        user_name: '王队',
        avatars: 'images/logo.png',
        //-2非好友,-1未处理,0拒绝,1接受,2删除
        status: 1

    }])
}

var friendsList = vm.createCollection({
    defaultData: util.store('friends_list')
})

if (!util.store('new_friends')) {

    util.store('new_friends', [{
        user_id: 30008,
        user_name: '小白',
        avatars: 'images/logo.png',
        msg: '你好！可以认识一下吗？',
        sign_text: '小白中的小白',
        address: '福建福州',
        //-2非好友,-1未处理,0拒绝,1接受,2删除
        status: -1
    }, {
        user_id: 30010,
        user_name: '红客',
        avatars: 'images/logo.png',
        msg: '你好！可以认识一下吗？',
        sign_text: '红客中的红客',
        address: '福建福州',
        //-2非好友,-1未处理,0拒绝,1接受,2删除
        status: -1
    }, {
        user_id: 30007,
        user_name: '小智',
        avatars: 'images/logo.png',
        msg: '你好！可以认识一下吗？',
        sign_text: '小智的小智',
        address: '福建福州',
        //-2非好友,-1未处理,0拒绝,1接受,2删除
        status: 1
    }, {
        user_id: 30009,
        user_name: '小网',
        avatars: 'images/logo.png',
        msg: '你好！可以认识一下吗？',
        sign_text: '独特的人',
        address: '福建福州',
        //-2非好友,-1未处理,0拒绝,1接受,2删除
        status: 0
    }])
}

var contact = Event.mixin({
    newFriends: function () {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: util.store('new_friends')
                    });
                }, 100)
            });

        return Http.post('/contact/newFriends');
    },

    person: function (user_id) {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                var new_friends = util.store('new_friends')

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: util.first(new_friends, 'user_id', user_id)
                    });
                }, 100)
            });

        return Http.post('/contact/person', {
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
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    var new_friends = util.store('new_friends');
                    var friend = util.first(new_friends, 'user_id', user_id);

                    friend.status = 1;

                    friendsList.add(friend);

                    util.store('friends_list', friendsList.data);

                    resolve({
                        success: true
                    });
                }, 100)
            });

        return Http.post('/contact/acceptFriend', {
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

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {

                    friendsList.set(util.store('friends_list'));

                    resolve({
                        success: true,
                        data: friendsList
                    });
                }, 100)
            });

        return Http.post('/contact/friends');
    },

    friend: function (user_id) {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: {
                            user_id: 1,
                            user_name: '福建移动',
                            avatars: 'images/logo.png',
                            msg: '你好！可以认识一下吗？',
                            sign_text: '独特的人',
                            address: '福建福州',
                            memo: '小猪',
                            enable_leave_msg: true,
                            //允许推送到首页
                            enable_push: true,
                            //-2非好友,-1未处理,0拒绝,1接受,2删除
                            status: 1
                        }
                    });
                }, 100)
            });

        return Http.post('/contact/person', {
            user_id: user_id
        });

    },

    deleteFriend: function (user_id) {

        return Http.post('/contact/deleteFriend', {
            user_id: user_id
        });
    }
});


module.exports = contact;