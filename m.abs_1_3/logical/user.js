var Loader = require('widget/loader');
var userModel = require('models/user');
var api = require('models/api');

var User = {
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


    getCouponList: function (callback, $el) {
        var user = userModel.get();

        new Loader({
            $el: $el,
            url: "/api/user/voucher_list",
            params: {
                status: 1,

                UserID: user.ID,
                Auth: user.Auth
            }

        }).load(callback);
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

        new Loader({
            $el: $el,
            url: "/api/user/GetCoupon",
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