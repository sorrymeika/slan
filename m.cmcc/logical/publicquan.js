var Promise = require('promise');
var Http = require('core/http');
var Loader = require('widget/loader');
var bridge = require('bridge');
var util = require('util');
var Event = require('core/event');

var user = require('models/user');
var auth = require('logical/auth');

if (!util.store('publicquan')) {

    util.store('publicquan', [{
        quan_id: 1,
        quan_name: '福建移动',
        quan_pic: 'images/logo.png',
        quan_m_pic: 'images/logo_m.png',
        follow_num: 1,
        is_follow: true,
        summary: '中国移动通信集团公司，是中国规模最大的移动通信运营商。福建移动通信责任有限公司是……'
    }, {
        quan_id: 2,
        quan_name: '和生活',
        quan_pic: 'images/logo.png',
        quan_m_pic: 'images/logo_m.png',
        follow_num: 1,
        is_follow: false,
        summary: '和生活……'
    }, {
        quan_id: 3,
        quan_name: '爱福建',
        quan_pic: 'images/logo.png',
        quan_m_pic: 'images/logo_m.png',
        follow_num: 0,
        is_follow: false,
        summary: '爱福建……'

    }])
}


if (!util.store('publicquan_messages')) {

    util.store('publicquan_messages', [{
        quan_id: 1,
        msg_id: 10,
        user_id: 0,
        date: 1476101924277,
        see: 4,
        like: 2,
        comment: 3,
        title: '最新消息',
        content: '圈子消息',
        imgs: ['images/logo.png', 'images/logo.png']
    }, {
        quan_id: 1,
        msg_id: 11,
        user_id: 0,
        date: 1477264843536,
        see: 12,
        like: 10,
        comment: 2,
        title: '快速调度您的资源',
        content: '1、快速调度您的资源<br>计算、存储、网络资源秒级响应，用户可拥有畅快的云服务体验，同时提供弹性伸缩服务，可以对用户的资源进行动态的调整，无需用户操作，自动伸缩应变。<br>2、最大程度保障您的业务安全<br>引入SDN解决方案，为用户提供VPC服务，用户可以创建100%二层隔离的子网，搭建自己的私有云环境；同时提供多种安全服务产品，轻松帮助用户应对各种攻击、安全漏洞等问题，保证云服务的正常运行。',
        imgs: ['images/logo.png', 'images/logo.png']
    }, {
        quan_id: 1,
        msg_id: 11,
        user_id: 30001,
        date: 1477264843536,
        see: 12,
        like: 10,
        comment: 2,
        title: '我的帖子',
        content: '我的最新帖子',
        imgs: ['images/logo.png', 'images/logo.png']
    }])
} else {
    var publicquan_messages = util.store('publicquan_messages');

    publicquan_messages.sort(function (a, b) {
        return a.date > b.date ? -1 : a.date == b.date ? 0 : 1
    });

    util.store('publicquan_messages', publicquan_messages)
}

if (!util.store('publicquan_comments')) {

    util.store('publicquan_comments', [{
        comment_id: 1,
        msg_id: 10,
        add_date: 1476101924277,
        avatars: 'images/logo.png',
        user_id: 10,
        user_name: '小黑',
        content: '休息下'

    }, {
        comment_id: 2,
        msg_id: 11,
        add_date: 1476101924277,
        avatars: 'images/logo.png',
        user_id: 10,
        user_name: '小白',
        content: '不行了'
    }])
}

var publicquan = Event.mixin({
    recommend: function () {
        return Http.post('/pub_quan_recommend/getAll');
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
        return Loader.pageLoader('/pub_quan_comments/getPage', 'comments', model)
            .setParam(params);
    },

    sendComment: function (msg_id, content) {
        return Http.post('/pub_quan_comments/add', {
            msg_id: msg_id,
            content: content
        }).then(function (res) {

            var data = {
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