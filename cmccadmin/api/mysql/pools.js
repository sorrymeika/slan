var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var util = require('../../../core/util');
var pools = {};
var pool;

var config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), { encoding: 'utf-8' }));

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

        pool = pools[str] || (pools[str] = mysql.createPool({
            connectionLimit: 1,
            host: data.host,
            user: data.user,
            password: data.password,
            queryFormat: function (query, values) {
                if (!values) return query;
                var result = query.replace(/\@p(\d+)/g, function (txt, key) {
                    return this.escape(values[key]);
                }.bind(this));

                console.log(result);

                return result;
            }
        }));

        callback && pool.getConnection(callback)

        return this;
    },
    getConnection: function (err, conn) {
        pool.getConnection(err, conn);
        return this;
    }
}
