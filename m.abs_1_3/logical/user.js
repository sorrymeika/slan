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

        }).request(callback);
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

        }).request(callback);
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

        }).request(callback);
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

        }).request(callback);
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

        }).request(callback);
    },

    getCouponStatus: function (csvId, callback, $el) {
        var user = userModel.get();

        new Loader({
            $el: $el,
            url: "/api/user/get_coupon_status",
            params: {
                id: csvId,
                UserID: user.ID,
                Auth: user.Auth
            },
            error: function () { }

        }).request(callback);
    }
};

module.exports = User;