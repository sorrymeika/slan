var Loader = require('widget/loader');
var Http = require('core/http');
var userModel = require('models/user');
var api = require('models/api');

var User = {
    updateUserName: function (userName) {
        return this.updateUser('userName', userName);
    },

    updateGender: function (gender) {

        return this.updateUser('gender', gender);
    },

    updateBirthDay: function (birthDay) {

        return this.updateUser('birthDay', birthDay);
    },

    updateChildBirthDay: function (birthDay) {

        return this.updateUser('childBirthDay', birthDay);
    },

    updateCity: function (cityId) {

        return this.updateUser('cityId', cityId);
    },

    updateUser: function (type, value) {
        var user = userModel.get();

        var data = {
            type: type,
            ID: user.ID,
            Auth: user.Auth
        };

        data[type] = value;

        return Http.post('/api/user/update', data)
    },

    getMonthGifts: function (freId, callback) {
        var user = userModel.get();

        new api.MonthAPI({
            params: {
                freid: freId,

                UserID: user.ID,
                Auth: user.Auth
            }

        }).load(callback);
    },

    getMonth: function (callback, $el) {
        var user = userModel.get();

        new Loader({
            $el: $el,
            url: "/api/user/get_month_gift",
            params: {

                UserID: user.ID,
                Auth: user.Auth
            }

        }).load(callback);
    },

    getMonthOverdue: function (callback, $el) {
        var user = userModel.get();

        return new Loader({
            $el: $el,
            url: "/api/user/get_month_overdue",
            params: {

                UserID: user.ID,
                Auth: user.Auth
            }

        }).request();
    },

    getMonthGot: function (callback, $el) {
        var user = userModel.get();

        return new Loader({
            $el: $el,
            url: "/api/user/get_month_got",
            params: {

                UserID: user.ID,
                Auth: user.Auth
            }

        }).request();
    },


    getCouponList: function ($el) {
        var user = userModel.get();

        return new Loader({
            $el: $el,
            url: "/api/user/voucher_list",
            params: {
                status: 1,

                UserID: user.ID,
                Auth: user.Auth
            }

        }).request();
    },
    getCoupon: function (csvId, callback, $el) {
        var user = userModel.get();

        new Loader({
            $el: $el,
            url: "/api/user/voucher_detail",
            params: {
                csvId: csvId,

                UserID: user.ID,
                Auth: user.Auth
            },
            error: function () { }

        }).load(callback);
    },

    recieveCoupon: function (csvcode, callback, $el) {

        var user = userModel.get();

        new api.CouponAPI({
            $el: $el,
            params: {
                csvcode: csvcode,
                pspcode: user.PSP_CODE
            },
            error: function () { }

        }).load(callback);
    },

    getCouponStatus: function (csvId, callback, $el) {
        var user = userModel.get();

        return new Loader({
            $el: $el,
            url: "/api/user/get_coupon_status",
            params: {
                id: csvId,
                UserID: user.ID,
                Auth: user.Auth
            },
            error: function () { }

        }).load(callback);
    }
};

module.exports = User;