﻿var http_proxy = require('../core/http_proxy');
//app.all('*', http_proxy('m.abs.cn', 7788));
//app.all('*', http_proxy('localhost', 6004));
//app.all('*', http_proxy('192.168.0.106', 6004));

var queue = require('../core/queue');
var fs = require('fs');
var fsc = require('../core/fs');
var path = require('path');
var razor = require('../core/razor');
var _ = require('underscore');
var Tools = require('../tools/tools');
var sass = require('node-sass');

var Util = require('util');
var util = require('../core/util');
_.extend(Util, util);

var joinPath = util.joinPath;
var formatJs = Tools.formatJs;

function trimPath(path) {
    var rpath = /(^\/)|(\/$)/g;
    return path.replace(rpath, '');
}

function combineRouters(config) {
    var result = {};
    config.projects.forEach(function (project) {
        for (var key in project.route) {
            var router = project.route[key];
            var regexStr = (trimPath(project.root) + '/' + trimPath(key)).replace(/^\.\//, '');

            if (typeof router == 'string') {
                router = {
                    controller: router,
                    template: router
                }
            } else {
                router = _.extend({}, router);
            }
            _.extend(router, {
                controller: joinPath("views", router.controller),
                template: joinPath("template", router.template)
            });

            router.root = project.root;

            result[regexStr] = router;
        }
    });
    return result;
}

exports.loadConfig = function (callback) {
    var async = new Async();

    fs.readFile('./global.json', { encoding: 'utf-8' }, function (err, globalStr) {
        var globalConfig = JSON.parse(globalStr);
        var subPromise = new Async().resolve();
        globalConfig.routes = {};

        subPromise.each(globalConfig.projects, function (i, project) {

            fs.readFile(path.join(project, 'config.json'), { encoding: 'utf-8' }, function (err, data) {
                var config = JSON.parse(data);
                config.root = project;

                subPromise.next(i, err, config);
            });

        }).then(function (err, result) {
            globalConfig.projects = result;

            async.resolve(null, callback(err, globalConfig));
        });

    });

    return async;
}

exports.createIndex = function (config, callback) {
    fs.readFile('./root.html', { encoding: 'utf-8' }, function (err, html) {

        var T = razor.nodeFn(html.replace(/^\uFEFF/i, ''));

        var async = new Async().resolve();
        var rimg = /url\(("|'|)([^\)]+)\1\)/g;

        async.each(config.css, function (i, cssPath) {
            fs.readFile(cssPath, { encoding: 'utf-8' }, function (err, style) {
                async.next(i, err, style.replace(/^\uFEFF/i, ''));
            });

        }).then(function (err, styles) {

            var style = styles.join('').replace(rimg, function (r0, r1, r2) {
                return /^data\:image\//.test(r2) ? r0 : ("url(images/" + r2 + ")");
            });

            callback(null, T.html(_.extend({}, config, {
                style: "<style>" + style + "</style>",
                routes: combineRouters(config)
            })));
        });
    });
}


exports.startWebServer = function (config) {
    var express = require('express');
    var app = express();

    config.resourceMapping = {};

    app.get('/', function (req, res) {
        exports.createIndex(config, function (err, html) {
            res.send(html);
        });
    });

    config.projects.forEach(function (project) {
        var root = trimPath(project.root);
        var requires = [];

        for (var key in project.js) {
            var fileList = project.js[key];
            if (fileList) {
                if (!_.isArray(fileList)) {
                    fileList = _.keys(fileList);
                }
                fileList.forEach(function (file) {
                    requires.push(joinPath(project.root, file));
                });
            }
        }

        for (var key in project.css) {
            project.css[key] && project.css[key].forEach(function (file) {
                requires.push(joinPath(project.root, file));
            });
        }

        app.all((root && root != '.' ? "/" + root : '') + '/template/[\\S\\s]+.js', function (req, res, next) {
            var filePath = req.url.replace(/\.js(\?.*){0,1}$/, '');

            fsc.readFirstExistentFile(['.' + filePath + '.html', '.' + filePath + '.cshtml', '.' + filePath + '.tpl'], function (err, text) {
                if (err) {
                    next();
                    return;
                }
                text = text.replace(/^\uFEFF/i, '');
                text = razor.web(text);
                res.set('Content-Type', "text/javascript; charset=utf-8");
                res.send(text);
            });
        });

        app.all((root && root != '.' ? "/" + root : '') + '/views/[\\S\\s]+.js', function (req, res, next) {
            var filePath = "." + req.url;

            fsc.readFirstExistentFile([filePath, filePath + 'x'], function (err, text) {
                if (err) {
                    next();
                    return;
                }
                text = text.replace(/^\uFEFF/i, '');

                text = formatJs(text);
                text = Tools.replaceDefine(filePath.replace(/(^\/)|(\.js$)/g, ''), text, requires);

                res.set('Content-Type', "text/javascript; charset=utf-8");
                res.send(text);
            });
        });
    });

    app.all('*.js', function (req, res, next) {
        var filePath = req.url;
        var isRazorTpl = /\.(html|tpl|cshtml)\.js$/.test(filePath);

        fsc.readFirstExistentFile(_.map(config.projects, 'root').concat(config.path), isRazorTpl ? [filePath.replace(/\.js$/, '')] : [filePath, filePath + 'x'], function (err, text) {
            if (err) {
                next();
                return;
            }
            text = text.replace(/^\uFEFF/i, '');
            if (isRazorTpl) text = razor.web(text);
            text = formatJs(text);

            res.set('Content-Type', "text/javascript; charset=utf-8");
            res.send(text);
        });
    });

    config.projects.forEach(function (project) {
        app.use(express.static(project.root));
    });

    config.path.forEach(function (searchPath) {
        app.use(express.static(searchPath));
    });

    app.all('*.css', function (req, res, next) {

        fsc.firstExistentFile(_.map(config.projects, 'root').concat(config.path), [req.params[0] + '.scss'], function (fileName) {
            if (!fileName) {
                next();
                return;
            }

            sass.render({
                file: fileName

            }, function (err, result) {
                if (err) {
                    console.log(err);
                    next();

                } else {
                    res.set('Content-Type', "text/css; charset=utf-8");
                    res.send(result.css.toString());
                }

            });
        });
    });

    app.use('/dest', express.static(config.dest));

    for (var key in config.proxy) {
        var proxy = config.proxy[key].split(':');
        app.all(key, http_proxy(proxy[0], proxy[1] ? parseInt(proxy[1]) : 80));
    }

    console.log("start with", config.port, process.argv);

    app.listen(config.port);
}

var argv = process.argv;
var args = {};

for (var i = 2, arg, length = argv.length; i < length; i++) {
    arg = argv[i];

    arg.replace(/--([^=]+)(?:\=(\S+)){0,1}/, function (match, key, value) {
        args[key] = value == undefined ? true : (/^(true|false|-?\d+)$/.test(value) ? eval(value) : value);
        return '';
    });
}

//打包
if (args.build) {
    exports.loadConfig(function (err, config) {
        _.extend(config, config.env[args.build === true ? 'production' : args.build], {
            debug: false
        });

        var baseDir = path.join(__dirname, './');
        var destDir = path.join(__dirname, config.dest);
        var tools = new Tools(baseDir, destDir);

        //打包框架
        tools.combine({
            "slan.m": config.framework
        });

        //合并js、css
        config.resourceMapping = tools.combine(config.combine);

        //生成首页
        exports.createIndex(config, function (err, html) {
            Tools.save(path.join(destDir, 'index.html'), Tools.compressHTML(html));
        });

        //打包业务代码
        config.projects.forEach(function (project) {
            var async = new Async().resolve();
            var codes = '';
            var requires = [];

            for (var key in project.js) {
                requires.push(joinPath(project.root, key));

                if (project.js[key]) {
                    //打包项目引用js                
                    (function (key, fileList, filePromise) {
                        var ids;
                        if (!_.isArray(fileList)) {
                            ids = _.keys(fileList);
                            fileList = _.map(fileList, function (value, id) {
                                return value || id;
                            });
                        }

                        filePromise.each(fileList, function (i, file) {
                            var isRazorTpl = /\.(html|tpl|cshtml)$/.test(file);

                            console.log(file);

                            fsc.readFirstExistentFile([project.root], isRazorTpl ? [file] : [file + '.js', file + '.jsx'], function (err, text, fileName) {

                                if (isRazorTpl) text = razor.web(text);
                                text = formatJs(text);
                                text = Tools.compressJs(Tools.replaceDefine(ids ? ids[i] : joinPath(project.root, file), text));

                                filePromise.next(i, err, text);
                            });

                        }).then(function (err, results) {

                            Tools.save(path.join(destDir, project.root, key + '.js'), results.join(''));
                        });

                    })(key, project.js[key], new Async().resolve());
                }
            }

            for (var key in project.css) {
                requires.push(joinPath(project.root, key));

                if (project.css[key] && project.css[key].length) {
                    //打包项目引用css
                    (function (key, fileList, filePromise) {
                        filePromise.each(fileList, function (i, file) {

                            fsc.firstExistentFile([path.join(project.root, file), path.join(project.root, file).replace(/\.css$/, '.scss')], function (file) {

                                if (/\.css$/.test(file)) {
                                    fs.readFile(file, 'utf-8', function (err, text) {
                                        text = Tools.compressCss(text);
                                        filePromise.next(i, err, text);
                                    });
                                } else {
                                    sass.render({
                                        file: file

                                    }, function (err, result) {
                                        result = Tools.compressCss(result.css.toString());
                                        filePromise.next(i, err, result);
                                    });
                                }
                            });

                        }).then(function (err, results) {
                            Tools.save(path.join(destDir, project.root, key), results.join(''));
                        });

                    })(key, project.css[key], new Async().resolve());
                }
            }

            //打包template和controller
            var contains = [];

            for (var key in project.route) {
                (function (router) {
                    var controller;
                    var template;

                    if (typeof router == 'string') {
                        controller = template = router;

                    } else {
                        controller = router.controller;
                        template = router.template;
                    }

                    controller = joinPath(project.root, 'views', controller);
                    template = joinPath(project.root, 'template', template);

                    var controllerPath = path.join(baseDir, controller);
                    var templatePath = path.join(baseDir, template);

                    async.then(function () {
                        //打包模版
                        fsc.readFirstExistentFile([templatePath + '.html', templatePath + '.cshtml', templatePath + '.tpl'], function (err, text, fileName) {
                            if (!err && contains.indexOf(fileName) == -1) {
                                contains.push(fileName);
                                text = razor.web(text);
                                text = Tools.compressJs(Tools.replaceDefine(template, text));
                                codes += text;
                            }

                            async.resolve();
                        });

                        return async;

                    }).then(function () {
                        //打包控制器
                        fsc.readFirstExistentFile([controllerPath + '.js', controllerPath + '.jsx'], function (err, text, fileName) {
                            if (!err && contains.indexOf(fileName) == -1) {
                                text = formatJs(text);
                                text = Tools.compressJs(Tools.replaceDefine(controller, text, requires, true));
                                codes += text;
                            }

                            async.resolve();
                        });

                        return async;
                    });

                })(project.route[key]);
            }

            //保存合并后的业务代码
            async.then(function () {
                Tools.save(path.join(destDir, project.root, 'controller.js'), codes);
            });
        });


        //复制图片资源
        var imgPromise = new Async().resolve();
        imgPromise.each(config.images, function (i, imgDir) {
            fsc.copy(path.join(baseDir, imgDir), path.join(config.dest, 'images'), '*.(jpg|png|eot|svg|ttf|woff)', function (err, result) {
                imgPromise.next(i, err, result);
            });

        }).then(function () {
            config.projects.forEach(function (proj) {

                if (proj.images) {
                    proj.images.forEach(function (imgDir) {
                        fsc.copy(path.join(proj.root, imgDir), path.join(config.dest, proj.root, 'images'), '*.(jpg|png)', function (err, result) {

                        });
                    });
                }
            });
        });
    });

} else {
    exports.loadConfig(function (err, config) {
        exports.startWebServer(config);
    });
}
