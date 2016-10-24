var util = require('util');
var model2 = require('core/model2');
var Http = require('core/http');
var Promise = require('promise');

var MESSAGETYPE = {
    TEXT: 1,
    IMAGE: 2
};

var chat = {
    MESSAGETYPE: MESSAGETYPE,

    getUnreadMessages: function () {
    },

    getMessages: function (user_id, page) {
        if (sl.isDev)
            return new Promise(function (resolve) {

                resolve({
                    success: true,
                    user: {
                        user_id: 1,
                        user_name: '小白',
                        avatars: 'images/logo.png'
                    },
                    data: [{
                        msg_id: 2,
                        fromId: 1,
                        toId: 30001,
                        type: 1,
                        date: 1477017801802,
                        content: "测试测试测试"
                    }, {
                        msg_id: 3,
                        type: 1,
                        fromId: 1,
                        toId: 30001,
                        //是否显示时间小标记
                        isShowTime: true,
                        date: 1477017801802,
                        content: "万万没想到万万没想到万万没\n想到万万没想到万万没想到万万没想到万万没想到"
                    }, {
                        msg_id: 4,
                        type: 1,
                        fromId: 30001,
                        toId: 1,
                        date: 1477017801802,
                        content: "万万没想到"
                    }, {
                        msg_id: 4,
                        type: 2,
                        fromId: 30001,
                        toId: 1,
                        date: 1477017801802,
                        content: "images/pubquan_header.png"
                    }]
                })
            });

        return Http.post({
            user_id: user_id,
            page: page || 1,
            pageSize: 20
        });
    }

};


module.exports = chat;