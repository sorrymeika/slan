var Promise = require('promise');
var Http = require('core/http');
var Loader = require('widget/loader');


var publicquan = {
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

    myrecommend: function () {
        if (sl.isDev) {
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: [{
                            quan: {
                                quan_id: 1,
                                quan_name: '福建移动',
                                quan_pic: 'images/logo.png'
                            },
                            lastMsg: {
                                msg_id: 10,
                                date: 1476101924277,
                                see: 100000,
                                like: 10000,
                                comment: 999,
                                title: '最新消息',
                                content: 'sub',
                                imgs: ['images/logo.png', 'images/logo.png']
                            }
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
                    resolve({
                        success: true,
                        data: [{
                            quan: {
                                quan_id: 1,
                                quan_name: '福建移动',
                                quan_pic: 'images/logo.png'
                            },
                            lastMsg: {
                                msg_id: 10,
                                date: 1476101924277,
                                see: 100000,
                                like: 10000,
                                comment: 999,
                                title: '最新消息',
                                content: '最最最最最新消息',
                                imgs: ['images/logo.png', 'images/logo.png']
                            }
                        }]
                    });
                }, 100)
            });

        return Http.post('/publicquan/myfollow');
    },

    //公众圈详情
    item: function (quan_id) {
        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: {
                            quan_id: 1,
                            quan_name: '福建移动',
                            quan_pic: 'images/logo.png',
                            quan_m_pic: 'images/logo_m.png',
                            follow_num: 1000000,
                            is_follow: true,
                            summary: '中国移动通信集团公司，是中国规模最大的移动通信运营商。福建移动通信责任有限公司是……'
                        }
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
                        data: [{
                            msg_id: 10,
                            date: 1476101924277,
                            see: 100000,
                            like: 10000,
                            comment: 999,
                            title: '最新消息',
                            content: 'sub',
                            imgs: ['images/logo.png', 'images/logo.png']
                        }, {
                            msg_id: 10,
                            date: 1476101924277,
                            see: 100000,
                            like: 10000,
                            comment: 999,
                            title: '最新消息',
                            content: 'sub',
                            imgs: ['images/logo.png', 'images/logo.png']
                        }]
                    });
                }, 100)
            });

        return Http.post('/publicquan/newArticles', {
            quan_id: quan_id
        });

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
                    data: [{
                        comment_id: 1,
                        msg_id: 10,
                        date: 1476101924277,
                        avatars: 'images/logo.png',
                        user_id: 10,
                        user_name: '小黑',
                        content: '休息下'
                    }]
                });

            } : function () { }
        });

        return loader;
    },


    article: function (msg_id) {

        if (sl.isDev)
            return new Promise(function (resolve, reject) {

                setTimeout(function () {
                    resolve({
                        success: true,
                        data: {
                            quan: {
                                quan_id: 1,
                                quan_name: '福建移动',
                                quan_pic: 'images/logo.png'
                            },
                            msg_id: 10,
                            date: 1476101924277,
                            see: 100000,
                            like: 10000,
                            comment: 999,
                            title: '最新消息',
                            content: '1、快速调度您的资源<br>计算、存储、网络资源秒级响应，用户可拥有畅快的云服务体验，同时提供弹性伸缩服务，可以对用户的资源进行动态的调整，无需用户操作，自动伸缩应变。<br>2、最大程度保障您的业务安全<br>引入SDN解决方案，为用户提供VPC服务，用户可以创建100%二层隔离的子网，搭建自己的私有云环境；同时提供多种安全服务产品，轻松帮助用户应对各种攻击、安全漏洞等问题，保证云服务的正常运行。',
                            imgs: ['images/logo.png', 'images/logo.png']
                        }
                    });
                }, 100)
            });

        return Http.post('/publicquan/comments', {
            msg_id: msg_id
        });

    }
}

module.exports = publicquan;