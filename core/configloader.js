var _ = require('underscore');

var path = require('path');
var Promise = require('./promise');
var fs = require('fs');

function ConfigLoader(configPath, env) {

    this.config = JSON.parse(JSON.stringify(require(configPath)));

    if (env) _.extend(this.config, require(configPath + '.' + env))

    this.configDir = path.dirname(configPath);
    this.routes = {};
    this.projects = [];
}

ConfigLoader.prototype = {
    loadConfig: function (project, callback) {
        var self = this;

        fs.readFile(path.join(this.configDir, project.replace(/\/$/, '') + '/config.json'), { encoding: 'utf-8' }, function (err, text) {
            if (err) {
                console.log(err);
                callback(err);
                return;
            }

            var webresource = self.config.webresource.replace(/\/$/, '') + '/',
                rwebresource = /@webresource\(('|")(.+?)\1\)/img;

            var data = text.replace(rwebresource, function (match, qt, url) {
                return '"' + webresource + url.replace(/^\//, '') + '"';
            })

            data = eval('[' + data + '][0]');

            data.root = '/' + data.root.replace(/^\/|\/$/g, '')
            data.webresource = webresource;

            var root = data.root == '/' ? '' : data.root,
                routeKey,
                routeData,
                routeOption;

            for (var key in data.route) {
                routeOption = data.route[key];
                routeData = {};

                if (typeof routeOption == 'string') {
                    routeData.template = routeData.controller = routeOption;

                } else {
                    routeData.controller = routeOption.controller;
                    routeData.template = routeOption.template || routeData.controller;
                    routeData.api = routeOption.api;
                }

                routeKey = root + key;
                routeData.root = data.root;
                routeData.controller = path.join('views', routeData.controller).replace(/\\/g, '/');
                routeData.template = path.join('template', routeData.template).replace(/\\/g, '/');

                self.routes[routeKey == '/' ? '/' : routeKey.replace(/\/$/, '')] = routeData;
            }

            callback(null, data);
        });
    },

    loadAll: function (callback) {
        var self = this;
        var promise = new Promise().resolve();

        return promise.each(self.config.projects, function (i, project) {

            self.loadConfig(project, function (err, data) {
                if (err) {
                    promise.next(i, err);
                    return;
                }

                _.extend(data, {
                    path: project,
                    debug: self.config.debug,
                    isDebugFramework: self.config.isDebugFramework
                });

                self.config.projects[i] = data;

                promise.next(i);
            });

        }).then(function () {
            //_.extend(self.config,{});

            callback(self.config, self.routes);
        });
    }
}


module.exports = function (configPath, env, callback) {
    if (typeof env === 'function') callback = env, env = undefined;
    new ConfigLoader(configPath).loadAll(callback);
};