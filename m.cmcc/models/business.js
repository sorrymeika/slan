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

    getNotifications: function () {
        return this._('notifications');
    },

    getGroups: function () {
        return businessGroup;
    },

    getAll: function () {
        return this._('list');
    },

    find: function (business_id) {
        return this._('list[business_id=' + business_id + '][0]');
    }
});

messagesList.observe("list", function () {

    business.set('dataver', Date.now());
});


business.observe(function () {

    var data = {};
    for (var i = 1; i <= 4; i++) {
        data['type' + i + 'data'] = {
            unread: 0,
            list: []
        };
    }

    //4:社交提醒,单独处理
    var maxDate = 0;
    messagesList.getList().each(function (item) {

        if (item.get('push_to_home')) {
            data.type4data.unread += item.get('unread') || 0;

            if (item.get('date') > maxDate) {
                data.type4data.title = item.get('user_name') + ':' + item.get('msg');
                data.type4data.content = item.get('msg');
                maxDate = item.get('date');
            }
        }
    });

    var notifications = business.get('notifications');
    //处理未读消息数量和业务分类的最新一条消息
    //单个业务最新一条消息的显示处理见:logical/business->getAllBusinessAndUnread
    business.getAll().each(function (busiModel, i) {
        var busi = busiModel.get();

        //[当前业务分类]1:生活,2:通信,3:娱乐
        var item = data['type' + busi.type + 'data'];

        //将最新一条设置为分类的消息显示
        if (busi.send_date) {
            if (!item.send_timestamp || item.send_timestamp < busi.send_date) {
                item.title = busi.title;
                item.content = busi.content;
                item.send_timestamp = busi.send_date;
                item.send_date = busi.send_date ? util.formatDate(busi.send_date, 'short') : '';
            }
        }

        //统计未读消息数量
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