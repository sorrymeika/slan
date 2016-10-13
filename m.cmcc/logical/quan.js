var Promise = require('promise');
var Http = require('core/http');
var Loader = require('widget/loader');

var util = require('util');

var quan = {

    getAll: function ($scroll) {

        var loader = new Loader({
            url: '/quan/getAll',

            $scroll: $scroll,

            pageEnabled: false
        });

        if (sl.isDebug) {
            return Promise.all([loader, Promise.resolve({
                success: true,
                data: [{
                    user_id: 1,
                    user_name: '小光',
                    msg_id: 111,
                    avatars: 'images/logo.png',
                    content: '阿斯顿发发',
                    date: 1476101924277,
                    imgs: ['images/logo.png', 'images/logo.png'],
                    comments: [{
                        comment_id: 111,
                        user_id: 2,
                        user_name: '小智',
                        content: '想休息休息',
                        at_user_id: 0,
                        at_user_name: 'xxx'
                    }]
                }, {
                        user_id: 3,
                        user_name: '小黑',
                        avatars: 'images/logo.png',
                        msg_id: 111,
                        content: '阿斯顿叔叔说发发',
                        date: 1476101924277,
                        imgs: ['images/logo.png', 'images/logo.png'],
                        comments: [{
                            comment_id: 111,
                            user_id: 4,
                            user_name: '小煤',
                            content: '想休ss息休息',
                            at_user_id: 2,
                            at_user_name: '小智'
                        }]
                    }]
            })]);
        }


        return Promise.all([loader, loader.request()]);
    },

    deleteQuan: function (msg_id) {

        return Http.post('/quan/deleteQuan', {
            msg_id: msg_id
        });
    },

    getHistory: function () {
        if (sl.isDebug)
            return Promise.resolve({
                success: true,
                data: [{
                    msg_id: 111,
                    content: '阿斯顿发发',
                    date: 1476101924277,
                    imgs: ['images/logo.png', 'images/logo.png'],
                    comments: [{
                        user_id: 2,
                        user_name: '小智',
                        content: '想休息休息',
                        at_user_id: 0,
                        at_user_name: 'xxx'
                    }]
                }, {
                        msg_id: 111,
                        content: '阿斯顿叔叔说发发',
                        date: 1476101924277,
                        imgs: ['images/logo.png', 'images/logo.png'],
                        comments: [{
                            user_id: 4,
                            user_name: '小煤',
                            content: '想休ss息休息',
                            at_user_id: 2,
                            at_user_name: '小智'
                        }]
                    }]
            });

        return Http.post('/quan/getHistory');
    }
}

module.exports = quan;