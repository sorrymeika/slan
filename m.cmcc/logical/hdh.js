var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var Event = require('core/event');
var Promise = require('promise');

var formatResult = function(res) {
    if (res.success) {
        res.data = JSON.parse(res.data);
        console.log(res.data);
    }

    return res;
}

var hdh = Event.mixin({
    getInfo: function() {
        return Http.post('/user_hdh/getInfo')
    },

    getPoolsub: function() {
        return Http.post('/user_hdh/getPoolsub').then(formatResult);
    },

    bindEntitySms: function(subphone) {
        return Http.post('/user_hdh/bindEntitySms', {
            subphone: subphone

        }).then(formatResult);
    },

    bindEntityConfirm: function(subphone, smscode) {
        return Http.post('/user_hdh/bindEntitySms', {
            subphone: subphone,
            smscode: smscode

        }).then(formatResult);
    }
});

module.exports = hdh;