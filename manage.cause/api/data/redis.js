//#帮助
//#启动redis
//src/redis-server &

//#启动时指定配置文件
//redis-server ./redis.conf
//#如果更改了端口，使用`redis-cli`客户端连接时，也需要指定端口，例如：
//redis-cli -p 6380

//#检测后台进程是否存在
//ps -ef |grep redis
//#使用`redis-cli`客户端检测连接是否正常
//src/redis-cli
//127.0.0.1:6379> keys *
//#停止
//redis-cli shutdown

var config = require('./config');

var redis = require('redis');

var client;

exports.client = function() {
    if (!client) {
        client = redis.createClient(config.redis);
    }
    return client;
};

exports.set = function(key, value, expire, callback) {
    if (typeof expire !== 'number') {
        callback = expire, expire = 0;
    }
    this.client().set(key, value, callback);
    if (expire) {
        client.expire(key, expire);
    }
    return this;
};

exports.hset = function(hkey, key, value, expire, callback) {
    if (typeof expire !== 'number') {
        callback = expire, expire = 0;
    }
    this.client().hset(hkey, key, value, callback);
    if (expire) {
        client.expire(key, expire);
    }
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

exports.expire = function(key, seconds) {
    this.client().expire(key, seconds);
    return this;
}
