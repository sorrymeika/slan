var util = require('util');
var Promise = require('promise');
var bridge = require('bridge');
var Http = require('core/http');
var userModel = require('models/user');
var auth = require('logical/auth');
var Loader = require('widget/loader');

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
            return res;
        });
    },

    setAvatars: function (imageId) {
        var sign = auth.getSign();

        return new Promise(function (resolve, reject) {
            bridge.image.upload(Loader.url('/userinfo/update'), Object.assign({}, sign), {
                avatars_file: imageId

            }, true, function (res) {
                if (res.success) {
                    resolve(res);

                } else {
                    reject(res)
                }
            });
        });
    },

    getMe: function () {
        return Http.post('/userinfo/getMe').then(function (res) {
            if (res.data) {
                userModel.set(res.data);
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

    getPrivacy: function () {
        return Http.post('/userinfo/getPrivacy');
    },

    updateExt: function (key, value) {
        return Http.post('/userinfo/updateExt', {
            key: key,
            value: value
        });
    },

    updateDeviceToken: function (deviceToken) {

        return Http.post('/user/updateDeviceToken', {
            device_token: deviceToken,
            device_type: util.ios ? 1 : 2
        });
    },

    getMessages: function (type) {
        return Http.post('/user/getFav');
    }
}

module.exports = User;