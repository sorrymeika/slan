var Promise = require('promise');
var Http = require('core/http');

var FAVORITE_TYPE = {
    QUAN: 0,
    PUBLIC_QUAN: 1
}

var User = {
    FAVORITE_TYPE: FAVORITE_TYPE,

    getFav: function () {
        if (sl.isDev)
            return Promise.resolve({
                success: true,
                data: [{
                    fav_id: 1,
                    msg_id: 111,
                    user_name: '',
                    avatars: 'images/logo.png',
                    type: FAVORITE_TYPE.QUAN,
                    content: '阿斯顿叔叔说发发',
                    date: 1476101924277,
                    imgs: ['images/logo.png', 'images/logo.png']
                }, {
                    fav_id: 2,
                    msg_id: 10,
                    quan_name: '福建移动',
                    quan_pic: 'images/logo.png',
                    quan_id: 1,
                    type: FAVORITE_TYPE.PUBLIC_QUAN,
                    date: 1476101924277,
                    title: '最新消息',
                    summary: '最最最最最新消息',
                    imgs: ['images/logo.png', 'images/logo.png']
                }]

            })

        return Http.post('/user/getFav');
    },

    getMessages: function (type) {
        if (sl.isDev)
            return Promise.resolve({
                success: true,
                data: "system" == type ? [{
                    msg_id: 111,
                    title: "系统消息",
                    summary: '系统消息系统消息系统消息系统消息系统消息',
                    date: 1476101924277,
                    isread: false
                }] : [{
                    msg_id: 111,
                    title: "国庆节假日流量套餐",
                    summary: '告别流量“饥饿”告别流量“饥饿”告别流量“饥饿”告别流量“饥饿”告别流量“饥饿”告别流量“饥饿”',
                    date: 1476101924277,
                    isread: false
                }, {
                    msg_id: 112,
                    title: "国庆节假日流量套餐",
                    summary: '告别流量“饥饿”',
                    date: 1476101924277,
                    isread: false
                }]

            })

        return Http.post('/user/getFav');
    }
}

module.exports = User;
