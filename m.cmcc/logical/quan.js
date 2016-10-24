var Http = require('core/http');
var Promise = require('promise');
var Loader = require('widget/loader');

var Event = require('core/event');

var util = require('util');

var user = require('models/user');

if (!util.store('quan_messages')) {

    util.store('quan_messages', [{
        user_id: 30002,
        user_name: '小白',
        msg_id: 111,
        avatars: 'images/logo.png',
        content: '阿斯顿发发',
        date: 1477044891630,
        imgs: ['images/logo.png', 'images/logo.png'],
        comments: [{
            comment_id: 111,
            user_id: 2,
            user_name: '小智',
            content: '想休息休息',
            at_user_id: 0,
            at_user_name: 'xxx'
        }],
        likes: [{
            user_id: 2,
            user_name: '小智'
        }, {
            user_id: 3,
            user_name: '小黑'
        }]
    }, {
        user_id: 3,
        user_name: '小黑',
        avatars: 'images/logo.png',
        msg_id: 112,
        content: '阿斯顿叔叔说发发',
        date: 1477017801802,
        imgs: ['images/logo.png', 'images/logo.png'],
        comments: [{
            comment_id: 111,
            user_id: 4,
            user_name: '小煤',
            content: '想休ss息休息',
            at_user_id: 2,
            at_user_name: '小智'
        }]
    }, {
        user_id: 30001,
        user_name: '我我我',
        avatars: 'images/logo.png',
        msg_id: 114,
        content: '阿斯顿叔叔说发发',
        date: 1477045110978,
        imgs: ['images/logo.png', 'images/logo.png'],
        comments: [{
            comment_id: 111,
            user_id: 4,
            user_name: '小煤',
            content: '想休ss息休息',
            at_user_id: 2,
            at_user_name: '小智'
        }]
    }]);

}

var quan = Event.mixin({

    getAll: function ($scroll) {

        var loader = new Loader({
            url: '/quan/getAll',

            $scroll: $scroll,

            pageEnabled: false
        });

        if (sl.isDev) {
            var messages = util.store('quan_messages');

            messages.sort(function (a, b) {
                return a.date > b.date ? -1 : a.date == b.date ? 0 : 1;
            })

            messages.forEach(function (msg) {

                if (msg.user_id == user.data.user_id) {
                    Object.assign(msg, user.data);
                }
            })

            util.store('quan_messages', messages);

            return Promise.all([loader, Promise.resolve({
                success: true,
                data: messages
            })]);
        }

        return Promise.all([loader, loader.request()]);
    },

    like: function (msg_id) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                var messages = util.store('quan_messages');

                var msg = util.first(messages, 'msg_id', msg_id);

                if (!msg.likes) {
                    msg.likes = [];
                }
                msg.likes.push({
                    user_id: user.data.user_id,
                    user_name: user.data.user_name
                })
                setTimeout(function () {
                    resolve({
                        success: true
                    });

                    quan.trigger('like:' + msg_id, {
                        isLike: true
                    })

                    util.store('quan_messages', messages);

                }, 100)
            });

        return Http.post('/quan/like', {
            msg_id: msg_id

        });
    },

    //屏蔽
    black: function (msg_id) {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                var messages = util.store('quan_messages');

                setTimeout(function () {
                    resolve({
                        success: true
                    });

                    quan.trigger('black:' + msg_id);

                    messages.splice(util.indexOf(messages, 'msg_id', msg_id), 1);


                    util.store('quan_messages', messages);


                }, 100)
            });

        return Http.post('/quan/black', {
            msg_id: msg_id
        });
    },

    //@params = { content:'', images:{}}
    publish: function (params) {

        if (sl.isDev) {
            return new Promise(function (resolve, reject) {

                var messages = util.store("quan_messages");

                var imgs = params.saveImages;

                var id = 0;

                messages.forEach(function (cmt) {
                    if (cmt.msg_id > id) {
                        id = cmt.msg_id + 1;
                    }
                });

                var msg = Object.assign({
                    msg_id: id,
                    likes: [],
                    comments: [],
                    date: Date.now(),
                    content: params.content,
                    imgs: imgs

                }, user.data);

                messages.push(msg);

                util.store("quan_messages", messages);

                quan.trigger('publish', msg);

                resolve({
                    success: true
                })
            });
        }

        return new Promise(function (resolve, reject) {
            bridge.image.upload(Loader.url('/publicquan/publish'), {
                title: params.title,
                content: params.content,
                quan_ids: params.quan_ids.join(',')

            }, params.images, function (res) {
                if (res.success) {
                    resolve(res);

                } else {
                    reject(res)
                }
            });
        })

    },

    sendComment: function (msg_id, content) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {
                var messages = util.store('quan_messages');

                setTimeout(function () {
                    resolve({
                        success: true
                    });

                    var message = util.first(messages, 'msg_id', msg_id);

                    var comments = message.comments;
                    var id = 0;

                    comments.forEach(function (cmt) {
                        if (cmt.comment_id > id) {
                            id = cmt.comment_id + 1
                        }
                    })

                    var data = {
                        comment_id: id,
                        msg_id: msg_id,
                        content: content,
                        date: Date.now()
                    }

                    data = Object.assign(data, user.data);

                    comments.push(data);

                    quan.trigger('sendComment', data);

                    util.store('quan_messages', messages);

                }, 100)
            });

        return Http.post('/quan/sendComment', {
            msg_id: msg_id,
            content: content
        });
    },

    deleteQuan: function (msg_id) {
        if (sl.isDev) {

            var messages = util.store('quan_messages');

            console.log(messages, msg_id);

            messages.splice(util.indexOf(messages, 'msg_id', msg_id), 1);

            util.store('quan_messages', messages);

            return Promise.resolve({
                success: true
            });
        }

        return Http.post('/quan/deleteQuan', {
            msg_id: msg_id
        });
    },

    getHistory: function () {
        if (sl.isDev) {

            var messages = util.store('quan_messages');

            return Promise.resolve({
                success: true,
                data: util.filter(messages, 'user_id', user.data.user_id)
            });
        }

        return Http.post('/quan/getHistory');
    }
})

module.exports = quan;