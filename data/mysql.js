var async = require('async');

var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: require('./config').host,
    user: 'root',
    password: '12345Qwert',
    database: 'domestic',
    queryFormat: function (query, values) {
        if (!values) return query;
        return query.replace(/\@p(\d+)/g, function (txt, key) {
            return this.escape(values[key]);
        }.bind(this));
    }
});

exports.connect = exports.connectMaster = pool.getConnection.bind(pool);
exports.connectSlave = pool.getConnection.bind(pool);
