var Promise = require('promise');
var Http = require('core/http');
var Loader = require('widget/loader');
var bridge = require('bridge');
var util = require('util');
var Event = require('core/event');

var user = require('models/user');
var auth = require('logical/auth');

var publicquan = Event.mixin({
    recommend: function () {
        return Http.post('/pub_quan/getRecommends');
    },

    search: function (keywords, page, pageSize) {
        return Http.post('/pub_quan/getPage', {
            quan_name: keywords,
            page: page || 1,
            pageSize: pageSize || 20
        });
    },

    myrecommend: function () {
        if (sl.isDev) {
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    var quan = util.store('publicquan')[0];
                    resolve({
                        success: true,
                        data: [{
                            quan: quan,
                            lastMsg: util.first(util.store('publicquan_messages'), 'quan_id', quan.quan_id)
                        }]
                    });
                }, 100)
            });
        }

        return Http.post('/publicquan/myrecommend');
    },

    myfollow: function () {
        return Http.post('/pub_quan_follow/getPage', {
            page: 1,
            pageSize: 20
        });
    },

    follow: function (quan_id) {
        return Http.post('/pub_quan_follow/update', {
            quan_id: quan_id
        });
    },

    //公众圈详情
    item: function (quan_id) {
        return Http.post('/pub_quan/getById', {
            quan_id: quan_id
        });
    },

    fav: function (quan_id) {
        return Http.post('/user_fav/add', {
            rev_id: quan_id,
            fav_type: 1
        });
    },

    unfav: function (quan_id) {
        return Http.post('/user_fav/delete', {
            rev_id: quan_id,
            fav_type: 1
        });
    },

    newArticles: function (quan_id) {
        return Http.post('/pub_quan_msg/getPage', {
            quan_id: quan_id,
            page: 1,
            pageSize: 20
        });
    },

    seeArticle: function (msg_id) {
        return Http.post('/pub_quan_msg/see', {
            msg_id: msg_id
        });
    },

    likePubQuanMsg: function (msg_id) {
        return Http.post('/pub_quan_likes/add', {
            msg_id: msg_id
        });
    },

    unlikePubQuanMsg: function (msg_id) {
        return Http.post('/pub_quan_likes/delete', {
            msg_id: msg_id
        });
    },

    article: function (msg_id) {

        return Http.post('/pub_quan_msg/getById', {
            msg_id: msg_id
        });
    },

    myArticles: function () {
        return Http.post('/pub_quan_msg/getMine', {
            page: 1,
            pageSize: 20
        });
    },

    //@params = {quan_ids:[], title:'', content:'', images:{}}
    publish: function (params) {

        if (!sl.isInApp) {
            return Http.post('/pub_quan_msg/add', {
                title: params.title,
                content: params.content,
                quan_ids: params.quan_ids.join(',')
            });
        }

        return new Promise(function (resolve, reject) {
            var sign = auth.getSign();

            bridge.image.upload(Loader.url('/pub_quan_msg/add'), Object.assign({
                title: params.title,
                content: params.content,
                quan_ids: params.quan_ids.join(',')

            }, sign), params.images, function (res) {
                if (res.success) {
                    resolve(res);

                } else {
                    reject(res)
                }
            });
        })
    },

    //@params={msg_id: msg_id, $scroll: $scroll}
    commentsLoader: function (params, model) {
        return Loader.pageLoader({
            url: '/pub_quan_comments/getPage',
            attribute: 'comments',
            model: model
        })
            .setParam(params);
    },

    sendComment: function (msg_id, rel_id, at_user_id, content) {
        return Http.post('/pub_quan_comments/add', {
            msg_id: msg_id,
            rel_id: rel_id,
            at_user_id: at_user_id,
            content: content
        }).then(function (res) {

            var data = {
                rel_id: rel_id,
                at_user_id: at_user_id,
                comment_id: res.data,
                msg_id: msg_id,
                content: content,
                date: Date.now()
            }
            data = Object.assign(data, user.data);

            publicquan.trigger('sendComment:' + msg_id, data)
            return res;
        });
    },

    delComment: function (comment_id) {
        return Http.post('/pub_quan_comments/delete', {
            comment_id: comment_id
        });
    }
})

module.exports = publicquan;