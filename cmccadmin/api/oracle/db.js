var oracledb = require('oracledb');
var fs = require('fs');
var path = require('path');
var util = require('../../../core/util');
var connections = {};
var config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), { encoding: 'utf-8' }));
var conf;

console.log(config);

var stringifyConn = function (data) {
    return data.user + ':' + data.password + '@' + data.host
}

module.exports = {
    setConfig: function (name, data) {
        config[name] = data;

        return this.saveConfig();
    },
    saveConfig: function () {
        fs.writeFileSync(path.join(__dirname, './config.json'), JSON.stringify(config), { encoding: 'utf-8' });
        return this;
    },
    getConfig: function (name) {
        if (name === undefined)
            return config;

        return config[name];
    },
    connect: function (data, callback) {
        if (typeof data == 'function') callback = data, data = config.currentConnection;

        var str = stringifyConn(data);

        if (str != stringifyConn(config.currentConnection)) {
            config.currentConnection = data;

            if (util.indexOf(config.connections, function (item) {
                return stringifyConn(item) == str;

            }) == -1) {
                config.connections.push(data);
            }
            this.saveConfig();
        }

        conf = connections[str] || (connections[str] = {
            connectString: data.host,
            user: data.user,
            password: data.password
        });

        callback && oracledb.getConnection(conf, callback)

        return this;
    },
    getConnection: function (callback) {
        oracledb.getConnection(callback);
        return this;
    }
}
