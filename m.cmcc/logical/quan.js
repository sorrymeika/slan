var Http = require('core/http');
var Promise = require('promise');
var Loader = require('widget/loader');

var Event = require('core/event');
var util = require('util');
var bridge = require('bridge');

var user = require('models/user');
var auth = require('logical/auth');

var quan = Event.mixin({

    getAll: function ($scroll) {

        var loader = new Loader({
            url: '/quan_msgs/getAll',

            $scroll: $scroll,

            pageEnabled: true
        });

        return Promise.all([loader, loader.request()]);
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

        return Http.post('/quan_msgs/getMine',{
            page: 1,
            pageSize: 20
        });
    }
})

module.exports = quan;