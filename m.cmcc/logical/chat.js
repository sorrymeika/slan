var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var Event = require('core/event');
var Promise = require('promise');

var messagesList = require('models/messagesList');
var friends = require('models/friends');
var contact = require('logical/contact');

var MESSAGETYPE = {
    NOTIFICATION: -1,
    TEXT: 1,
    IMAGE: 2,
    SEND_YUNMI: 3,
    GET_SEND_YUNMI: 4,
    YUNMI_REDBAG: 5,
    GET_YUNMI_REDBAG: 6
};

var _gid = 1;

function keep() {
    Http.post("/messages/keep").then(function(res) {
        var messages = res.data;

        if (messages && messages.length) {

            var hasNewNotification = false;

            messages.forEach(function(msg) {

                switch (msg.type) {
                    case MESSAGETYPE.TEXT:
                    case MESSAGETYPE.IMAGE:
                        chat.record(false, msg.from_id, msg);
                        chat.trigger('message:' + msg.from_id, msg);
                        break;
                    case MESSAGETYPE.NOTIFICATION:
                        hasNewNotification = true;
                        break;
                }
            });

            if (hasNewNotification) {
                chat.trigger('NEW_NOTIFICATIONS_COMING');
            }
        }

        setTimeout(keep, 1000);

    }).catch(function() {
        setTimeout(keep, 10000);
    });
}
keep();

var chat = Event.mixin({
    MESSAGETYPE: MESSAGETYPE,

    readMessage: function(friend_id) {
        var record = messagesList.getFriendLastMessage(friend_id);
        if (record) {
            record.set('unread', 0);
        }
    },

    formatMessages: function(messages) {

        messages.forEach(function(msg) {
            switch (msg.type) {
                case MESSAGETYPE.SEND_YUNMI:
                case MESSAGETYPE.GET_SEND_YUNMI:
                case MESSAGETYPE.YUNMI_REDBAG:
                case MESSAGETYPE.GET_YUNMI_REDBAG:
                    msg.content = JSON.parse(msg.content);
                    break;
            }
        });

        return messages;
    },

    record: function(is_send, friend_id, msg) {

        var records = messagesList.getList();
        var record = records.find('user_id', friend_id);

        var recordData = {
            user_id: friend_id,
            date: Date.now(),
            msg: msg.type == MESSAGETYPE.IMAGE ? '[图片]' : msg.type == MESSAGETYPE.SEND_YUNMI ? '[转账]' : msg.type == MESSAGETYPE.GET_SEND_YUNMI ? '[收钱]' : msg.type == MESSAGETYPE.YUNMI_REDBAG ? '[云米红包]' : msg.type == MESSAGETYPE.GET_YUNMI_REDBAG ? '[收红包]' : msg.content
        };

        if (!record) {
            if (!is_send) {
                recordData.unread = 1;
            }
            friend = friends.getFriend(friend_id);

            if (friend.get('name_for_show')) {
                recordData.avatars = friend.get('avatars');
                recordData.user_name = friend.get('name_for_show');

            } else {
                contact.friends();
            }

            records.add(recordData);

        } else {
            if (!is_send) {
                recordData.unread = (recordData.unread || 0) + 1;
            } else {
                recordData.unread = 0;
            }
            record.set(recordData);
        }
    },

    getMessages: function(friend_id, last_msg_id) {

        return Http.post("/messages/getMessages", {
            friend_id: friend_id,
            last_msg_id: last_msg_id || 0,
            type: 0

        }).then(function(res) {

            res.data.sort(function(a, b) {
                return a.msg_id < b.msg_id ? -1 : a.msg_id > b.msg_id ? 1 : 0
            });
            return res;
        });
    },

    getGid: function() {
        return ++_gid;
    },

    send: function(params) {
        params = {
            to_id: params.to_id,
            content: params.content,
            type: params.type,
            is_show_time: params.is_show_time || 0,
            isSending: true
        };

        this.record(true, params.to_id, params);

        return Http.post("/messages/sendMessage", params).then(function(res) {

            params.msg_id = res.data;
            params.gid = gid;
            params.isSending = false;
            params.add_date = Date.now();

            chat.trigger('sendresult:' + to_id, params);

            return res;
        });
    }

});


module.exports = chat;