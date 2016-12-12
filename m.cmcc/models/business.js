var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var messagesList = require('./messagesList');

var businessGroup = vm.createModel({});

var business = vm.createModel({
    defaultData: util.store('business_model') || {
        //业务列表
        list: [],
        //最新通知列表
        notifications: []
    },

    getNotifications: function() {
        return this._('notifications');
    },

    getGroups: function() {
        return businessGroup;
    }
});

business.observe(function() {

    var data = {};
    for (var i = 1; i <= 4; i++) {
        data['type' + i + 'data'] = {
            unread: 0,
            list: []
        };
    }

    var maxDate = 0;
    messagesList.getList().each(function(item) {
        data.type4data.unread += item.get('unread') || 0;

        if (item.get('date') > maxDate) {
            data.type4data.title = item.get('user_name') + ':' + item.get('msg');
            data.type4data.content = item.get('msg');
            maxDate = item.get('date');
        }
    });

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

        var unread = 0;

        for (var i = 0, len = notifications.length; i < len; i++) {
            if (notifications[i] && !notifications[i].isRead && notifications[i].business_id == busi.business_id) {
                unread++;
            }
        }
        item.unread = (item.unread || 0) + unread;

        if (busi.unread != unread) {
            busi.unread = unread;
            busiModel.set('unread', unread);
        }

        item.list.push(busi);
    });

    businessGroup.set(data);

    util.store('business_model', this.data);
});

module.exports = business;