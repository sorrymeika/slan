var Memcached=require('memcached');

var memcached=new Memcached(require('./config').host+":11211");

module.exports=memcached;