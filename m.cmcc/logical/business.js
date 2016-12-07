var util = require('util');
var model2 = require('core/model2');
var Http = require('core/http');
var Promise = require('promise');
var businessModel = require('models/business');
var Loader = require('widget/loader');

var business = {
    getAllBusinessAndUnread: function() {
        var last_read_time = util.store('last_read_time');
        if (!last_read_time) {
            last_read_time = util.formatDate(Date.now());
        }

        return Http.post('/business/getAllBusinessAndUnread', {
            lastReadDate: util.formatDate(last_read_time)

        }).then(function(res) {
            util.store('last_read_time', res.serverTime);

            var list = businessModel._('list');
            
            list.update(res.data, 'business_id');

            if (res.unreadNotifications) {
                var notifications = businessModel._('notifications');
                if (notifications) {
                    notifications.update(res.unreadNotifications, 'notify_id');
                } else {
                    businessModel.set('notifications', res.unreadNotifications);
                }

                var ids = [];

                list.data.forEach(function(item) {
                    var first = util.first(res.unreadNotifications, 'business_id', item.business_id);

                    if (first) {
                        ids.push(first.notify_id);
                    }
                });

                if (ids.length) {
                    Http.post('/business/getNotificationTitlesByIds', {
                        ids: ids.join(',')

                    }).then(function(res) {

                        list.update(util.map(res.data, ['business_id', 'title', 'content', 'send_date']), 'business_id');
                    })
                }
            }

            return res;
        });
    },

    notificationsLoader: function(model, beforeRender) {
        return Loader.pageLoader({
            url: "/business/getNotifications",
            model: model,
            beforeRender: beforeRender
        });
    }
}

module.exports = business;