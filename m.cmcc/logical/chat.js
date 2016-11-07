var util = require('util');
var model2 = require('core/model2');
var Http = require('core/http');
var Event = require('core/event');
var Promise = require('promise');

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