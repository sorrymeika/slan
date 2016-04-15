var redis = require("../data/redis");
var _ = require("underscore");
var USRTOKEN_REDIS_KEY = "usertoken";
var USR_REDIS_KEY = "user";

var User = {
    captcha: {},
    /*
        setToken: function(uid, token, callback) {
            redis.hset(USRTOKEN_REDIS_KEY, uid, token, callback);
        },
    
        getToken: function(uid, callback) {
            redis.hget(USRTOKEN_REDIS_KEY, uid, callback);
        },
    */
    set: function(uid, user, callback) {
        redis.hset(USR_REDIS_KEY, uid, JSON.stringify(user), callback);
    },

    get: function(uid, callback) {

        redis.hget(USR_REDIS_KEY, uid, function(err, res) {
            callback && callback(err, res ? JSON.parse(res) : null);
        });
    }
};

module.exports = User;