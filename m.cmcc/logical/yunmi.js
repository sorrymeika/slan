var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var Event = require('core/event');
var Promise = require('promise');


var yunmi = Event.mixin({
    receiveYunmi: function (yunmi_id) {

        return Http.post("/user_yunmi/receiveYunmi", {
            yunmi_id: yunmi_id
        });
    },

    getTotalYunmi: function () {
        return Http.post("/user_yunmi/getTotalYunmi");
    },

    getYunmi: function () {
        return Http.post("/user_yunmi/getYunmi");
    },

    getUsersYunmi: function (ids) {
        return Http.post("/user_yunmi/getUsersYunmi", {
            ids: ids
        });
    },

    receiveShakeYunmi: function (yunmi_id) {
        return Http.post("/user_yunmi/receiveShakeYunmi", {
            yunmi_id: yunmi_id
        });
    },

    getYunmiDetails: function (date) {
        return Http.post("/user_yunmi/getYunmiDetails", {
            date: date
        });
    },

    sendYunmi: function (mobile, amount, memo) {
        return Http.post("/user_yunmi/sendYunmi", {
            mobile: mobile,
            amount: amount,
            memo: memo
        });
    },

    sendRedbag: function (params) {
        return Http.post("/user_yunmi/sendRedbag", params);
    },

    getTrade: function (trade_id) {
        return Http.post("/user_yunmi/getTrade", {
            trade_id: trade_id
        });
    },

    receiveRedbag: function (redbag_id) {
        return Http.post("/user_yunmi/receiveRedbag", {
            redbag_id: redbag_id
        });
    },

    receiveSend: function (trade_id) {
        return Http.post("/user_yunmi/receiveSend", {
            trade_id: trade_id
        });
    }
});


module.exports = yunmi;