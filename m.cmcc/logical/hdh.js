var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var Event = require('core/event');
var Promise = require('promise');

var hdhModel = require('models/hdh');


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
        params: data,
        complete: function (res) {
            formatResult(res);
        }
    }).request();
}

var hdh = Event.mixin({

    getInfo: function () {
        return post('/user_hdh/getInfo').then(function (res) {
            var list = hdhModel.getSubPhoneList()
                .update(true, res.data.subphonelist, 'subphone');

            console.log(list);

            console.log(list._('[alias=""].subphone'))

            return res;
        });
    },

    subinfo: function (subphone) {

        return post('/user_hdh/subinfo', {
            subphone: subphone

        }).then(function (res) {

            hdhModel.getSubInfo(subphone).set(res.data.subphoneinfo);

            return res;
        });

    },

    getPoolsub: function () {
        return post('/user_hdh/getPoolsub');
    },

    bindsub: function (subphone) {
        return post('/user_hdh/bindsub', {
            subphone: subphone
        });
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
    },

    getAlias: function (subphones) {
        return Http.post('/user_hdh/getAlias', {
            subphones: subphones.join(',')

        }).then(function (res) {

            //hdhModel.getSubInfo(subphone).set('alias', alias);

            return res;
        });
    },

    setAlias: function (subphone, alias) {
        return Http.post('/user_hdh/setAlias', {
            subphone: subphone,
            alias: alias

        }).then(function (res) {

            hdhModel.getSubInfo(subphone).set('alias', alias);

            return res;
        });
    },

    setPower: function (subphone, isOff) {
        return post('/user_hdh/setPower', {
            subphone: subphone,
            isOff: isOff

        }).then(function (res) {

            hdh.subinfo();

            return res;
        });
    },

    interceptSms: function (subphone, isOff) {
        return post('/user_hdh/interceptSms', {
            subphone: subphone,
            isOff: isOff

        }).then(function (res) {

            hdh.subinfo();

            return res;
        });
    },

    interceptCall: function (subphone, isOff) {
        return post('/user_hdh/interceptCall', {
            subphone: subphone,
            isOff: isOff

        }).then(function (res) {

            hdh.subinfo();

            return res;
        });
    }

});

module.exports = hdh;