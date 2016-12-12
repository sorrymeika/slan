var util = require('util');
var model2 = require('core/model2');
var Http = require('core/http');
var Promise = require('promise');
var businessModel = require('models/business');
var Loader = require('widget/loader');

var business = {
    getThirdUrl: function () {
        return Http.post('/business/getThirdUrl');
    },

    getAllBusinessAndUnread: function () {
        var last_read_time = util.store('last_read_time');
        if (!last_read_time) {
            last_read_time = util.formatDate(Date.now());
        }

        return Http.post('/business/getAllBusinessAndUnread', {
            lastReadDate: util.formatDate(last_read_time)

        }).then(function (res) {
            util.store('last_read_time', res.serverTime);

            var list = businessModel._('list');

            list.update(res.data, 'business_id', true);

            if (res.unreadNotifications || res.unreadSysNotifications) {

                var unreadNotifications = [];

                if (res.unreadNotifications && res.unreadNotifications.length) {
                    unreadNotifications = unreadNotifications.concat(res.unreadNotifications);
                }
                if (res.unreadSysNotifications && res.unreadSysNotifications.length) {
                    unreadNotifications = unreadNotifications.concat(res.unreadSysNotifications);
                }

                var notifications = businessModel._('notifications');
                notifications.update(unreadNotifications, 'notify_id');

                var ids = [];

                list.data.forEach(function (item) {
                    var first = util.first(unreadNotifications, 'business_id', item.business_id);

                    if (first) {
                        ids.push(first.notify_id);
                    }
                });

                if (ids.length) {
                    Http.post('/business/getNotificationTitlesByIds', {
                        ids: ids.join(',')

                    }).then(function (res) {

                        list.update(util.map(res.data, ['business_id', 'title', 'content', 'send_date']), 'business_id');
                    })
                }
            }

            return res;
        });
    },

    notificationsLoader: function (model, beforeRender) {
        return Loader.pageLoader({
            url: "/business/getNotifications",
            model: model,
            beforeRender: beforeRender
        });
    },

    addBill: function (business_id, unitno, user_code, memo) {
        return Http.post("/user_business/add", {
            unitno: unitno,
            business_id: business_id,
            type: business_id == 100004 ? 'WAT01' : business_id == 100005 ? 'EFE01' : 'GAS01',
            user_code: user_code,
            funcode: 'PUB_CX',
            memo: memo
        });
    },

    updateBill: function (id, business_id, unitno, user_code, memo) {
        return Http.post("/user_business/update", {
            ubid: id,
            unitno: unitno,
            business_id: business_id,
            user_code: user_code,
            memo: memo
        });
    },

    deleteUserBusiness: function (ubid) {
        return Http.post("/user_business/deleteById", {
            ubid: ubid
        });
    },

    getUserBusiness: function (business_id) {
        return Http.post("/user_business/getUserBusiness", {
            business_id: business_id
        });
    },

    queryBusiness: function (ubid) {
        return Http.post("/user_business/queryBusiness", {
            id: ubid
        });
    }
}

module.exports = business;