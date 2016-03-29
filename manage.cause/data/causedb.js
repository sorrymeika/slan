var mysql = require('mysql');
var _ = require('underscore');
var config = require('./config');

var pool = mysql.createPool(_.extend(config.mysql, {
    connectionLimit: 10,
    database: 'Cause',
    queryFormat: function(query, values) {
        if (!values) return query;
        return query.replace(/\@p(\d+)/g, function(txt, key) {
            return this.escape(values[key]);
        }.bind(this));
    }
}));

exports.connect = exports.connectMaster = pool.getConnection.bind(pool);
exports.connectSlave = pool.getConnection.bind(pool);