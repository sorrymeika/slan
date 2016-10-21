var util = require('util');
var model2 = require('core/model2');
var bridge = require('bridge');

var contact = {
    newFriends: function () {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: [{
                            user_id: 1,
                            user_name: '福建移动',
                            avatars: 'images/logo.png',
                            msg: '你好！可以认识一下吗？',
                            //-2非好友,-1未处理,0拒绝,1接受,2删除
                            status: -1
                        }]
                    });
                }, 100)
            });

        return Http.post('/contact/newFriends');
    },

    person: function (user_id) {

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
                            //-2非好友,-1未处理,0拒绝,1接受,2删除
                            status: -1
                        }
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

    friends: function () {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: [{
                            user_id: 1,
                            user_name: '小王',
                            avatars: 'images/logo.png'
                        }, {
                            user_id: 1,
                            user_name: '用户b',
                            avatars: 'images/logo.png'
                        }, {
                            user_id: 3,
                            user_name: '小张',
                            avatars: 'images/logo.png'
                        }, {
                            user_id: 5,
                            user_name: '王队',
                            avatars: 'images/logo.png'
                        }]
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
};


module.exports = contact;