var _ = require('underscore');

var path = require('path');
var Tools = require('./../tools/tools');
var Util = require('util');
var util = require('./util');
var razor = require('./razor');
var Promise = require('./promise');
var fs = require('fs');

_.extend(Util, util);

var express = require('express');
var app = express();

var generateHomePage = function (project) {

    var promise = new Promise();
    fs.readFile(path.join(project, './index.tpl'), { encoding: 'utf-8' }, function (err, data) {

        data = data.replace(/^\uFEFF/i, '');
        data = Tools.compressJs(razor.node(data))

        fs.writeFile(path.join(project, './index.js'), data, function (err, res) {
            promise.resolve();
        });
    });
    return promise;
};

//<!--映射SEO页面
var mapViews = function (project, config, routes) {

    var home = require(path.join(project, './index'));
    var Route = require('./route');
    var route = new Route(routes);
    var combine = {};

    for (var i = 0, cfg, length = config.projects.length; i < length; i++) {
        cfg = config.projects[i];

        if (cfg.css) {
            for (var key in cfg.css) {
                var cssPath = path.join(cfg.path, key);
                var fileList = combine[cssPath];
                if (!fileList) combine[cssPath] = fileList = [];

                var cssList = cfg.css[key];

                cssList.forEach(function (css) {
                    fileList.push(path.join(cfg.path, css).replace(/\\/g, '/'));
                });
            }
        }
    }

    for (var i = 0, cfg, option, length = config.projects.length; i < length; i++) {
        cfg = config.projects[i];

        option = _.extend({}, cfg, {
            routes: routes,
            isDebugFramework: config.isDebugFramework,
            css: combine
        });

        cfg.option = option;
        cfg.html = Tools.compressHTML(home.html(option));
    }

    app.get("*", function (req, res, next) {
        var data = route.match(req.url),
            cfg;

        if (data) {
            res.set('Content-Type', 'text/html');

            for (var i = 0, cfg, length = config.projects.length; i < length; i++) {
                cfg = config.projects[i];

                if (cfg.root == data.root) {
                    res.send(Tools.compressHTML(home.html(cfg.option)).replace('</head>', '<script>if(!location.hash)location.hash="' + data.url + '";</script></head>'));
                    break;
                }
            }

        } else {
            next();
        }
    });
};
//映射SEO页面-->

//<!--映射控制器路由
var mapControllers = function (config) {
    config.projects.forEach(function (data, i) {

        var root = data.root == '/' ? '' : data.root,
            devPath = '/webresource/js' + root;

        app.get(devPath + '/template/*.js', function (req, res) {
            res.set('Content-Type', 'text/javascript');

            fs.readFile('.' + root + '/template/' + req.params[0] + '.tpl', {
                encoding: 'utf-8'

            }, function (err, text) {
                if (err) {
                    res.send(err);
                    return;
                }
                text = text.replace(/^\uFEFF/i, '');
                text = razor.web(text);
                res.send(text);
            });
        });

        app.get(devPath + '/*/*.js', function (req, res, next) {
            res.set('Content-Type', 'text/javascript');

            fs.readFile('.' + root + '/' + req.params[0] + '/' + req.params[1] + '.js', { encoding: 'utf-8' }, function (err, text) {
                if (err) {
                    //res.send(err);
                    next();
                } else {
                    res.send(text);
                }
            });
        });
    });
}
//映射控制器路由-->

var configloader = require('../core/configloader');

exports.start = function (project, callback) {

    configloader(path.join(project, './config'), function (config, routes) {
        var args = process.argv;

        for (var i = 2, arg, length = args.length; i < length; i++) {
            arg = args[i];

            arg.replace(/--([^=]+)(?:=(.+)){0,1}/, function (match, key, value) {
                config[key] = value == undefined ? true : eval(value);
                return '';
            });
        }

        generateHomePage(project)
            .then(function () {
                mapViews(project, config, routes);
                mapControllers(config, routes);
            })
            .then(function () {
                if (config.build) {
                    require(path.join(project, './build'))();
                }

                app.use(express.static(project));
                app.use(express.static(path.join(project, 'webresource')));
                app.use(express.static(path.join(__dirname, '../webresource')));
                app.use('/webresource/js', express.static(path.join(__dirname, '../webresource/js.m')));
                app.use('/webresource', express.static(path.join(__dirname, '../webresource')));
                app.use('/webresource/images', express.static(path.join(__dirname, '../webresource/images.m')));

                config.projects.forEach(function (proj) {
                    app.use(path.join('/webresource/js', proj.path).replace(/\\/g, '/'), express.static(proj.path));
                    app.use(path.join('/webresource', proj.path).replace(/\\/g, '/'), express.static(path.join(proj.path, './webresource')));
                });

                app.get('/webresource/js/*.js', function (req, res) {
                    res.set('Content-Type', 'text/javascript');

                    var template = '../webresource/js/' + req.params[0];

                    fs.exists(template, function (exists) {

                        fs.readFile(exists ? template : req.params[0], {
                            encoding: 'utf-8'

                        }, function (err, text) {
                            if (err) {
                                res.send(err);
                                return;
                            }
                            text = text.replace(/^\uFEFF/i, '');
                            text = razor.web(text);
                            res.send(text);
                        });
                    });
                });

                callback(app);

                app.listen(config.port);
                console.log("start with", config.port, project, process.argv);
            });
    });
}
