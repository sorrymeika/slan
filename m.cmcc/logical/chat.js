var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var Event = require('core/event');
var Promise = require('promise');

var messagesList = require('models/messagesList');
var contact = require('logical/contact');

var MESSAGETYPE = {
    TEXT: 1,
    IMAGE: 2
};

var _gid = 1;

function keep() {
    Http.post("/messages/keep").then(function (res) {

        var messages = res.data;

        if (messages && messages.length) {
            messages.forEach(function (msg) {

                console.log(msg);

                switch (msg.type) {
                    case MESSAGETYPE.TEXT:
                    case MESSAGETYPE.IMAGE:
                        chat.record(msg.from_id, msg.content);
                        chat.trigger('message:' + msg.to_id, msg);
                        break;
                }
            });
        }

        setTimeout(keep, 1000)
    });
}
keep();

var chat = Event.mixin({
    MESSAGETYPE: MESSAGETYPE,

    record: function (friend_id, content) {

        var records = messagesList._('list');
        var record = records.find('user_id', friend_id);

        var recordData = {
            user_id: friend_id,
            date: Date.now(),
            msg: content
        };

        if (!record) {
            contact.person(friend_id).then(function (res) {
                recordData.user_name = res.data.user_name;
                recordData.avatars = res.data.avatars;
                records.add(recordData);
            });

        } else {
            record.set(recordData);
        }
    },

    getUnreadMessages: function () {
    },

    getMessages: function (friend_id, last_msg_id) {

        return Http.post("/messages/getMessages", {
            friend_id: friend_id,
            last_msg_id: last_msg_id || 0,
            type: 0

        }).then(function (res) {

            res.data.sort(function (a, b) {
                return a.msg_id < b.msg_id ? -1 : a.msg_id > b.msg_id ? 1 : 0
            });
            return res;
        });
    },

    getGid: function () {
        return ++_gid;
    },

    send: function (params) {
        params = {
            to_id: params.to_id,
            content: params.content,
            type: params.type,
            is_show_time: params.is_show_time || 0,
            isSending: true
        };

        this.record(params.to_id, params.content);


        return Http.post("/messages/sendMessage", params).then(function (res) {

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