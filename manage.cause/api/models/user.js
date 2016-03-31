var redis = require("../data/redis");
var _ = require("underscore");
var USRTOKEN_REDIS_KEY = "usertoken";

var User = {
    captcha: {},

    setToken: function(uid, token, callback) {
        redis.hset(USRTOKEN_REDIS_KEY, uid, token, callback);
    },

    getToken: function(uid, callback) {
        redis.hget(USRTOKEN_REDIS_KEY, uid, callback);
    }
};

module.exports = User;