var host=require('./config').host;

var redis=require('redis');

exports.connect=exports.connectMaster=function() {
    return redis.createClient('6379',host);
};

exports.connectSlave=function() {
    return redis.createClient('6379',host);
};