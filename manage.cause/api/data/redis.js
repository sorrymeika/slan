var config = require('./config');

var redis = require('redis');

var client;

exports.client = function() {
    if (!client) {
        client = redis.createClient(config.redis);
    }
    return client;
};

exports.set = function(key, value, callback) {
    this.client().set(key, value, callback);
    return this;
};

exports.hset = function(hkey, key, value, callback) {
    this.client().hset(hkey, key, value, callback);
    return this;
};

exports.get = function(key, callback) {
    this.client().get(key, callback);
    return this;
}

exports.hget = function(hkey, key, callback) {
    this.client().hget(hkey, key, callback);
    return this;
}