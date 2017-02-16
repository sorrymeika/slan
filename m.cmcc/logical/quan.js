var Http = require('core/http');
var Promise = require('promise');
var Loader = require('widget/loader');

var Event = require('core/event');
var util = require('util');
var bridge = require('bridge');

var user = require('models/user');
var auth = require('logical/auth');

var quan = Event.mixin({

    createLoader: function (options) {

        return Loader.pageLoader(Object.assign({
            url: '/quan_msgs/getPage',
            pageEnabled: true,
            beforeRender: function (res) {
                res.data.forEach(function (item) {
                    if (item.imgs) {
                        item.imgs = item.imgs.split(',');
                    }
                });
            }
        }, options));
    },

    like: function (msg_id) {

        return Http.post('/quan_likes/add', {
            msg_id: msg_id
        }).then(function (res) {

            quan.trigger('like:' + msg_id, {
                isLike: true
            });

            return res;
        });
    },

    //屏蔽
    black: function (msg_id) {
        return Http.post('/quan_msg_black/add', {
            msg_id: msg_id
        }).then(function (res) {
            quan.trigger('black:' + msg_id);
            return res;
        });
    },

    //@params = { content:'', images:{}}
    publish: function (params) {
        if (!sl.isInApp) {
            return Http.post('/quan_msgs/add', {
                content: params.content
            });
        }

        return new Promise(function (resolve, reject) {

            var sign = auth.getSign();

            bridge.image.upload(Loader.url('/quan_msgs/add'), Object.assign({
                content: params.content

            }, sign), params.images, function (res) {
                if (res.success) {
                    resolve(res);

                } else {
                    reject(res)
                }
            });
        })

    },

    sendComment: function (msg_id, content) {
        return Http.post('/quan_comments/add', {
            msg_id: msg_id,
            content: content
        });
    },

    deleteQuan: function (msg_id) {

        return Http.post('/quan_msgs/delete', {
            msg_id: msg_id
        });
    },

    getHistory: function () {

        return Http.post('/quan_msgs/getMine', {
            page: 1,
            pageSize: 20
        });
    },

    getQuanBlack: function (type) {

        return Http.post('/quan/getQuanBlack', {
            type: type
        });
    },

    addQuanBlack: function (friend_id, type) {

        return Http.post('/quan/addQuanBlack', {
            type: type,
            friend_id: friend_id
        });
    },

    deleteQuanBlack: function (black_id) {

        return Http.post('/quan/deleteQuanBlack', {
            black_id: black_id
        });
    }
})

module.exports = quan;