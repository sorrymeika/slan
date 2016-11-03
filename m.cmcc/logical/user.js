var util = require('util');
var Promise = require('promise');
var Http = require('core/http');
var userModel = require('models/user');

var FAVORITE_TYPE = {
    QUAN: 2,
    PUBLIC_QUAN: 1
}

var User = {
    FAVORITE_TYPE: FAVORITE_TYPE,

    set: function (type, value) {
        var params = {};
        params[type] = value;

        return Http.post('/userinfo/update', params).then(function (res) {
            userModel.set(type, value);
            util.store('user', userModel.data);
            return res;
        });
    },

    getMe: function () {
        return Http.post('/userinfo/getMe').then(function (res) {
            if (res.data) {
                userModel.set(res.data);

                util.store('user', res.data);
            }
            return res;
        });
    },

    getFav: function () {
        return Http.post('/user_fav/getPage', {
            page: 1,
            pageSize: 20
        });
    },

    delFav: function (fav_id) {
        return Http.post('/user_fav/delete', {
            fav_id: fav_id
        });
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
