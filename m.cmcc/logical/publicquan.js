var Promise = require('promise');
var Http = require('core/http');


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
    }
}

module.exports = publicquan;