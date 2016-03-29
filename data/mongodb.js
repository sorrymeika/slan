var MongoClient=require('mongodb').MongoClient;

exports.connect=exports.connectMaster=function (callback) {
    MongoClient.connect('mongodb://sa:12345Qwert@'+require('./config').host+':27017/domestic',callback);
}

exports.connectSlave=function (callback) {
    MongoClient.connect('mongodb://sa:12345Qwert@'+require('./config').host+':27017/domestic',callback);
};