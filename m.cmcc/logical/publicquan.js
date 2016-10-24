var Promise = require('promise');
var Http = require('core/http');
var Loader = require('widget/loader');
var bridge = require('bridge');
var util = require('util');
var Event = require('core/event');

var user = require('models/user');

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
        date: 1476101924277,
        avatars: 'images/logo.png',
        user_id: 10,
        user_name: '小黑',
        content: '休息下'

    }, {
        comment_id: 2,
        msg_id: 11,
        date: 1476101924277,
        avatars: 'images/logo.png',
        user_id: 10,
        user_name: '小白',
        content: '不行了'
    }])
}

var publicquan = Event.mixin({
    recommend: function () {
        if (sl.isDev) {
            return Promise.resolve({
                success: true,
                data: [{
                    quan_id: 1,
                    quan_name: '福建移动',
                    quan_pic: 'images/logo.png'
                }, {
                    quan_id: 2,
                    quan_name: '和生活',
                    quan_pic: 'images/logo.png'
                }, {
                    quan_id: 3,
                    quan_name: '和生活',
                    quan_pic: 'images/logo.png'
                }, {
                    quan_id: 4,
                    quan_name: '和生活',
                    quan_pic: 'images/logo.png'
                }]
            });
        }

        return Http.post('/publicquan/recommend');
    },

    search: function (keywords) {
        if (sl.isDev) {
            return Promise.resolve({
                success: true,
                data: util.filter(util.store('publicquan'), function (item) {
                    return item.quan_name.indexOf(keywords) != -1;
                })
            });
        }

        return Http.post('/publicquan/search');
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
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    var quans = util.filter(util.store('publicquan'), 'is_follow', true).map(function (item) {

                        return {
                            quan: item,
                            lastMsg: util.first(util.store('publicquan_messages'), 'quan_id', item.quan_id)
                        }

                    });

                    resolve({
                        success: true,
                        data: quans
                    });
                }, 100)
            });

        return Http.post('/publicquan/myfollow');
    },

    follow: function (quan_id) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    var myfollow = util.store('publicquan');
                    var quan = util.first(myfollow, 'quan_id', quan_id);

                    quan.is_follow = !quan.is_follow;

                    util.store('publicquan', myfollow);

                    resolve({
                        success: true,
                        is_follow: quan.is_follow
                    });
                }, 100)
            });

        return Http.post('/publicquan/follow');
    },

    //公众圈详情
    item: function (quan_id) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: util.first(util.store('publicquan'), 'quan_id', quan_id)
                    });

                }, 100)
            });

        return Http.post('/publicquan/item', {
            quan_id: quan_id
        });
    },

    newArticles: function (quan_id) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: util.filter(util.store('publicquan_messages'), 'quan_id', quan_id)
                    });
                }, 100)
            });

        return Http.post('/publicquan/newArticles', {
            quan_id: quan_id
        });

    },

    seeArticle: function (msg_id) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {
                var list = util.store('publicquan_messages');

                var msg = util.first(list, 'msg_id', msg_id);

                msg.see += 1;

                util.store('publicquan_messages', list);

                setTimeout(function () {
                    resolve({
                        success: true,
                        see: msg.see
                    });
                }, 100)
            });

        return Http.post('/publicquan/seeArticle', {
            msg_id: msg_id
        });
    },

    likePubQuanMsg: function (msg_id) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                var list = util.store('publicquan_messages');

                var msg = util.first(list, 'msg_id', msg_id);

                if (msg.is_like) {
                    reject({
                        message: '请勿重复点赞'
                    })
                    return;
                }

                msg.like += 1;
                msg.is_like = true;

                util.store('publicquan_messages', list);

                setTimeout(function () {

                    resolve({
                        success: true,
                        like: msg.like,
                        message: '点赞成功'
                    });
                }, 100)
            });

        return Http.post('/publicquan/likePubQuanMsg', {
            msg_id: msg_id
        });
    },

    article: function (msg_id) {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                var msg = util.first(util.store('publicquan_messages'), 'msg_id', msg_id);

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: $.extend({
                            quan: util.first(util.store('publicquan'), 'quan_id', msg.quan_id)

                        }, msg)
                    });
                }, 100)
            });

        return Http.post('/publicquan/article', {
            msg_id: msg_id
        });
    },

    myArticles: function () {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: util.filter(util.store("publicquan_messages"), 'user_id', user.data.user_id).map(function (msg) {

                            return Object.assign({
                                quan: util.first(util.store('publicquan'), 'quan_id', msg.quan_id)
                            }, msg)
                        })
                    });
                }, 100)
            });

        return Http.post('/publicquan/myArticles');
    },

    //@params = {quan_ids:[], title:'', content:'', images:{}}
    publish: function (params) {

        if (sl.isDev) {
            return new Promise(function (resolve, reject) {

                var messages = util.store("publicquan_messages");

                console.log(params.images);
                var imgs = params.saveImages;

                var id = 0;

                messages.forEach(function (cmt) {
                    if (cmt.msg_id > id) {
                        id = cmt.msg_id + 1
                    }
                });

                params.quan_ids.forEach(function (quan_id) {

                    messages.push({
                        msg_id: id,
                        see: 0,
                        like: 0,
                        comment: 0,
                        date: Date.now(),
                        title: params.title,
                        content: params.content,
                        quan_id: quan_id,
                        imgs: imgs
                    });
                })

                util.store("publicquan_messages", messages);

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


    //@params={msg_id: msg_id, $scroll: $scroll}
    createCommentsLoader: function (params, success, append) {

        var loader = new Loader({
            url: '/publicquan/getcomments',

            $scroll: params.$scroll,

            params: {
                msg_id: params.msg_id
            },

            pageEnabled: false,

            success: success,

            append: append,

            complete: sl.isDev ? function () {

                success({
                    success: true,
                    data: util.filter(util.store('publicquan_comments'), 'msg_id', params.msg_id)
                });

            } : function () { }
        });

        return loader;
    },

    sendComment: function (msg_id, content) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true
                    });

                    var comments = util.store('publicquan_comments');
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

                    comments.push(data)

                    util.store('publicquan_comments', comments);

                    publicquan.trigger('sendComment:' + msg_id, data)

                }, 100)
            });

        return Http.post('/publicquan/sendComment', {
            msg_id: msg_id,
            content: content
        });
    },

    delComment: function (comment_id) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                var comments = util.store('publicquan_comments');

                comments.splice(util.indexOf(comments, 'comment_id', comment_id), 1);

                util.store('publicquan_comments', comments);

                setTimeout(function () {
                    resolve({
                        success: true
                    });

                }, 100)
            });

        return Http.post('/publicquan/delComment', {
            comment_id: comment_id
        });
    }
})

module.exports = publicquan;