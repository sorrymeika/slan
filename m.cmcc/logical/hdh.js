var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var Event = require('core/event');
var Promise = require('promise');

var formatResult = function (res) {
    var matchCode;
    if (res.success) {
        res.data = JSON.parse(res.data);

    } else if (res.message && (matchCode = res.message.match(/^(\d+?)\|(.+)/))) {
        res.retCode = matchCode[1];
        res.message = matchCode[2];
    }

    return res;
}

var post = function (url, data) {
    return new Http({
        url: url,
        data: data,
        complete: function (res) {
            formatResult(res);
        }
    }).request();
}

var hdh = Event.mixin({

    getInfo: function () {
        return post('/user_hdh/getInfo');
    },

    getPoolsub: function () {
        return post('/user_hdh/getPoolsub');
    },

    bindEntitySms: function (subphone) {
        return post('/user_hdh/bindEntitySms', {
            subphone: subphone
        });
    },

    bindEntityConfirm: function (subphone, smscode) {
        return post('/user_hdh/bindEntityConfirm', {
            subphone: subphone,
            smscode: smscode
        });
    }
});

module.exports = hdh;