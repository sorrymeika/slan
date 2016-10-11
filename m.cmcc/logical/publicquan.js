var Promise = require('promise');
var Http = require('core/http');


var publicquan = {
    recommend: function () {
        return new Promise(function (resolve, reject) {

            if (sl.isDebug) {
                resolve({
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
                return;
            }

            new Http({
                url: '/publicquan/recommend',
                success: resolve,
                error: reject

            }).request()
        });
    },

    myrecommend: function () {
        return new Promise(function (resolve, reject) {

            if (sl.isDebug) {

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
                return;
            }

            new Http({
                url: '/publicquan/myrecommend',
                success: resolve,
                error: reject

            }).request()
        });
    },

    myfollow: function () {
        return new Promise(function (resolve, reject) {

            if (sl.isDebug) {

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
                return;
            }

            new Http({
                url: '/publicquan/myfollow',
                success: resolve,
                error: reject

            }).request()
        });
    }
}

module.exports = publicquan;