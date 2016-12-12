var Http = require('core/http');
var md5 = require('utils/md5');

var title = 'aaa';
var content = 'bbb';
var request_seq = '1234';
var request_time = '1234';
var msisdn = "15900914293";
var request_time = +new Date();
var notify_type = 1;
var feature = {
    a: 1
};

var appid = 100001;
var secret_key = '4411d2e0eddc54cb19ef568443257efb';

var sign = appid + "," + title + "," + content + "," + request_seq + "," + msisdn + "," + request_time + "," + notify_type + "," + JSON.stringify(feature) + "," + secret_key;

sign = md5.md5(sign);

new Http({
    contentType: 'json',
    url: 'http://wxcs.ie1e.com/api/notification/receive',
    params: {
        appid: appid,
        sign: sign,
        title: title,
        content: content,
        "request_seq": request_seq,
        "request_time": request_time,
        "msisdn": msisdn,
        "notify_type": notify_type,
        feature: feature
    }
}).request();
