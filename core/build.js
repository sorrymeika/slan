var path = require('path');
var fs = require('fs');
var Promise = require('./promise');
var razor = require('./razor');
var configloader = require('./configloader');
var Tools = require('../tools/tools');

var build = function (config, routes, projectsRequires) {
    var tmplPromise = Promise.resolve();
    var views = {};
    var Route = require('./route');
    var route = new Route(routes);

    tmplPromise.each(route.routes, function (i, buildConfig) {

        var templatePath = './' + buildConfig.template + '.tpl',
            viewPath = './' + buildConfig.view + '.js',
            count = 2,
            callback = function () {
                count--;
                if (count == 0) {
                    tmplPromise.next(i);
                }
            },
            root = buildConfig.root == '/' ? '/' : (buildConfig.root + '/'),
            viewInfo = views[root];

        if (!viewInfo) views[root] = viewInfo = { code: '', records: {} };

        if (!viewInfo.records[buildConfig.template]) {
            viewInfo.records[buildConfig.template] = true;

            fs.readFile(templatePath, { encoding: 'utf-8' }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    var nodeCode = Tools.compressJs(razor.node(data));
                    var code = Tools.compressJs(Tools.replaceDefine(buildConfig.template, ));

                    Tools.save(path.join(config.node_dest, buildConfig.template + '.js'), nodeCode);

                    viewInfo.code += code;
                }
                callback();
            });
        } else {
            callback();
        }

        fs.readFile(viewPath, { encoding: 'utf-8' }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var requires,
                    tmpRequire;
                if (projectsRequires && (tmpRequire = projectsRequires[buildConfig.root]) && tmpRequire.length) {
                    requires = tmpRequire;
                }
                var code = Tools.compressJs(Tools.replaceDefine(buildConfig.view, data, requires, requires.exclude));

                viewInfo.code += code;
            }
            callback();
        });
    })
    .then(function () {
        for (var key in views) {
            Tools.save(config.dest + key + 'controller.js', views[key].code);
        }

        Tools.save(path.join(config.node_dest, 'config.js'), 'module.exports=' + JSON.stringify(config));
        Tools.copy(path.join(config.node_dest, 'index.js'), './index.js');
    });

    return tmplPromise;
}

var getWebsourcePath = function (root, dir, url, callback) {
    var dirs = [path.join(root, dir, 'webresource'), path.join(root, 'webresource'), path.join(__dirname, '../webresource')];
    var fileName;

    for (var i = 0; i < dirs.length; i++) {
        fileName = path.join(dirs[i], url);
        if (fs.existsSync(fileName)) {
            return path.relative(root, fileName).replace(/\\/g, '/');
        }
    }
};

var getJsPath = function (root, dir, url, callback) {
    var dirs = [path.join(root, dir), root, path.join(__dirname, '../webresource/js'), path.join(__dirname, '../webresource/js.m')];
    var fileName;

    for (var i = 0; i < dirs.length; i++) {
        fileName = path.join(dirs[i], url + '.js');
        if (fs.existsSync(fileName)) {
            return path.relative(root, fileName).replace(/\\/g, '/');
        }
    }
};

module.exports = function (root, env, isMobile, callback) {
    if (typeof isMobile == 'function') callback = isMobile, isMobile = true;

    configloader(path.join(root, 'config'), env, function (config, routes) {

        var combine = {};
        var requires = {};
        var commonCss = {};
        var home = require(path.join(root, './index'));

        config.node_dest = path.join(root, config.node_dest);
        config.dest = path.join(root, config.dest);

        config.projects.forEach(function (project) {

            if (project.css) {
                for (var key in project.css) {
                    var fileList = combine[key];
                    if (!fileList) combine[key] = fileList = [];

                    var cssList = project.css[key];
                    var requireList = requires[project.root];
                    if (!requireList) requires[project.root] = requireList = [];

                    if (requireList.indexOf(key) == -1) {
                        requireList.push(key);
                    }

                    cssList.forEach(function (css) {
                        var file = getWebsourcePath(root, project.path, css);
                        if (file && fileList.indexOf(file) == -1) {
                            fileList.push(file);
                        }
                    });
                }
            }

            if (project.js) {
                for (var key in project.js) {
                    var fileList = combine[key];
                    if (!fileList) combine[key] = fileList = [];

                    var jsList = project.js[key];
                    var requireList = requires[project.root];
                    if (!requireList) requires[project.root] = requireList = [];

                    if (requireList.indexOf(key) == -1) {
                        requireList.push(key);
                    }
                    if (!requireList.exclude) requireList.exclude = [];

                    jsList.forEach(function (js) {
                        console.log(project.path, js);
                        requireList.exclude.push(js);
                        var file = getJsPath(root, project.path, js);
                        if (file && fileList.indexOf(file) == -1) {
                            console.log(file);
                            fileList.push(file);
                            requireList.exclude.push(file, file.replace(/\.js$/, ''));
                        }
                    });
                }
            }

            console.log('project.path', project.path);

            Tools.save(path.join(config.dest, project.path, 'index.html'), home.html({
                routes: routes,
                isDebugFramework: false,
                webresource: '',
                debug: false,
                css: {},
                js: {}
            }));
        });

        var tools = new Tools(root, config.dest);
        tools.combine(combine);

        build(config, routes, requires);

        var fsc = require('./fs');

        fsc.copy(path.join(__dirname, '../webresource/images' + (isMobile ? '.m' : '')), path.join(config.dest, 'images'), '*.(jpg|png)', function (err, result) {

            config.projects.forEach(function (proj) {
                fsc.copy(path.join(proj.path, '/webresource/images'), path.join(config.dest, proj.path, 'images'), '*.(jpg|png)', function (err, result) { });
            });

            callback(config, tools);
        });
    });
}