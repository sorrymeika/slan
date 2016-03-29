var useCluster = true;
var cluster = require('cluster');
var _ = require('underscore');
var config = require('./config');
var args = process.argv;

var path = require('path');
var Tools = require('./../tools/tools');

var Util = require('util');
var util = require('./util');
var razor = require('./razor');
var Promise = require('./promise');
var fs = require('fs');

_.extend(Util, util);

for (var i = 2, arg, length = args.length; i < length; i++) {
    arg = args[i];

    arg.replace(/--([^=]+)(?:=(.+)){0,1}/, function (match, key, value) {
        config[key] = value == undefined ? true : eval(value);
        return '';
    });
}

var routes = config.routes;
var projects = config.projects;

if (useCluster && cluster.isMaster) {

    var cpuCount = require('os').cpus().length;

    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    cluster.on('exit', function (worker) {

        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });

} else {

    var http = require('http');
    var express = require('express');
    var app = express();
    var promise = Promise.resolve();

    var T = require('./index');
    var Route = require('./route');
    var route = new Route(routes);

    for (var i = 0, project, length = projects.length; i < length; i++) {
        project = projects[i];

        project.html = Tools.compressHTML(T.html(_.extend({
            routes: routes,
            isDebugFramework: false

        }, project)));
    }

    var setContent = function (html, data, content) {
        return html.replace('<body>', '<body><div class="view" data-url="' + util.encodeHTML(data.url) + '" data-path="' + util.encodeHTML(data.path) + '">' + content + '</div>');
    };

    app.get("*", function (req, res, next) {
        var data = route.match(req.url),
            html,
            tmpl;

        if (data) {
            res.set('Content-Type', 'text/html');

            for (var i = 0, project, length = projects.length; i < length; i++) {
                project = projects[i];

                if (project.root === data.root) {
                    html = project.html.replace('</head>', '<script>if(!location.hash)location.hash="' + data.url + '";</script>');

                    if (!/webkit|safari|chrome|msie|Trident|android|ipad|iphone|ipod/i.test(req.headers['user-agent'])) {
                        res.send(html);

                    } else {

                        tmpl = require('./' + data.template);

                        if (data.api) {
                            if (!/^http/.test(data.api)) {
                                data.api = 'http://' + req.headers.host + data.api;
                            }

                            http.get(data.api, function (response) {
                                //console.log("Got response: "+response.statusCode);

                                response.setEncoding('utf8');

                                response.on('data', function (chunk) {

                                    if (response.statusCode == 200) {
                                        res.send(setContent(html, data, tmpl.html(JSON.parse(chunk))));

                                    } else {
                                        res.send(setContent(html, data, "GET " + data.api + " " + response.statusCode));
                                    }
                                });

                            }).on('error', function (e) {
                                res.send(setContent(html, data, e.message));

                            });
                        } else {
                            res.send(setContent(html, data, tmpl.html()));
                        }
                    }

                    break;
                }
            }

        } else {
            next();
        }
    });

    app.listen(config.port);
    console.log("start with", config.port, __dirname, process.argv, 'Worker:' + (useCluster ? cluster.worker.id : '0'));
}