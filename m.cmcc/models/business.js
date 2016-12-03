var vm = require('core/model2');
var util = require('util');
var $ = require('$');
var businessGroup = vm.createModel({});

var business = vm.createModel({
    defaultData: util.store('business_model') || {
        list: []
    },

    getGroups: function() {
        return businessGroup;
    }
});

business.on('datachanged', function() {

    util.store('business_model', this.data);

    var data = {};
    for (var i = 1; i <= 4; i++) {
        data['type' + i + 'data'] = {
            unread: 0,
            list: []
        };
    }
    var notifications = business.get('notifications');
    business._('list').each(function(busiModel, i) {
        var busi = busiModel.get();

        var item = data['type' + busi.type + 'data'];

        if (busi.send_date) {
            if (!item.send_timestamp || item.send_timestamp < busi.send_date) {
                item.title = busi.title;
                item.content = busi.content;
                item.send_timestamp = busi.send_date;
                item.send_date = busi.send_date ? util.formatDate(busi.send_date, 'short') : '';
            }
        }

        item.list.push(busi);

        var unread = 0;

        for (var i = 0, len = notifications.length; i < len; i++) {
            if (notifications[i] && !notifications[i].isRead && notifications[i].business_id == busi.business_id) {
                unread++;
            }
        }

        item.unread += unread;

        if (busi.unread != unread) {
            busiModel.set('unread', unread);
        }
    });

    businessGroup.set(data);
});

module.exports = business;