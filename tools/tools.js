var UglifyJS = require('uglify-js');
var razor = require('./../core/razor');

var replaceBOM = function (text) {
    return text.replace(/^\uFEFF/i, '');
}

var compressCss = function (res) {
    return replaceBOM(res).replace(/\s*([;|,|\{|\}])\s*/img, '$1').replace(/\{(\s*[-a-zA-Z]+\s*\:\s*[^;\}]+?(;|\}))+/mg, function (match) {
        return match.replace(/\s*:\s*/mg, ':');
    }).replace(/[\r\n]/mg, '').replace(/;}/mg, '}').replace(/\s*\/\*.*?\*\/\s*/mg, '');
}

var compressor = UglifyJS.Compressor({
    sequences: true,  // join consecutive statemets with the “comma operator”
    properties: true,  // optimize property access: a["foo"] → a.foo
    dead_code: true,  // discard unreachable code
    drop_debugger: true,  // discard “debugger” statements
    unsafe: false, // some unsafe optimizations (see below)
    conditionals: true,  // optimize if-s and conditional expressions
    comparisons: true,  // optimize comparisons
    evaluate: true,  // evaluate constant expressions
    booleans: true,  // optimize boolean expressions
    loops: true,  // optimize loops
    unused: true,  // drop unused variables/functions
    hoist_funs: true,  // hoist function declarations
    hoist_vars: false, // hoist variable declarations
    if_return: true,  // optimize if-s followed by return/continue
    join_vars: true,  // join var declarations
    cascade: true,  // try to cascade `right` into `left` in sequences
    side_effects: true,  // drop side-effect-free statements
    warnings: false,  // warn about potentially dangerous optimizations/code
    global_defs: {}
});

var rcmd = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|(?:^|\b|\uFEFF)(module\.exports\s*=|exports\.[a-z0-9A-Z\._]+\s*=)/mg;
var rdefine = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*define|(?:^|\uFEFF|[^$])(\bdefine\()/g;

function isTest(regex, text) {
    regex.lastIndex = 0;
    var m;
    do {
        m = regex.exec(text);
        if (m && m[1]) {
            return true;
        }

    } while (m);

    return false;
}

function sealize(jsText) {
    if ((isTest(rcmd, jsText) || isTest(REQUIRE_RE, jsText)) && !isTest(rdefine, jsText)) {
        jsText = "define(function (require, exports, module) {" + jsText + "});";
    }
    return jsText;
}

function formatJs(jsText) {
    jsText = sealize(jsText);

    var rdom = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\s*(return\s+|=|\:|\()\s*(<([a-zA-Z]+)[^>]*>[\s\S]*?<\/\3>)\s*(,|;|\}|\))/mg;

    jsText = jsText.replace(rdom, function (match, symbol, dom, tagName, end) {

        return dom ? symbol + "'" + dom.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/(\s*(\r|\n)+\s*)+/g, ' ') + "'" + end : match;
    });

    return jsText;
}


var compressJs = function (code, mangle_names) {
    code = replaceBOM(code).replace(/\/\/<--debug[\s\S]+?\/\/debug-->/img, '');

    var ast = UglifyJS.parse(code);
    ast.figure_out_scope();
    ast = ast.transform(compressor);
    ast.compute_char_frequency();
    ast.mangle_names(mangle_names);
    code = ast.print_to_string();

    return code;
};

var concat = function () {
    var res = [],
        arr;

    for (var i = 0; i < arguments.length; i++) {
        arr = arguments[i];
        arr.forEach(function (item) {
            if (res.indexOf(item) == -1) {
                res.push(item);
            }
        });
    }
    return res;
};

var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
var SLASH_RE = /\\\\/g;

function parseDependencies(code) {
    var ret = [];
    //var m = code.match(REQUIRE_NAME_RE);
    //var requireRe;
    //requireRe = new RegExp("\\b" + m[1] + "\\s*\\(\\s*([\"'])(.+?)\\1\\s*\\)", 'g');

    code.replace(SLASH_RE, "")
        .replace(REQUIRE_RE, function (m, m1, m2) {
            if (m2) {
                ret.push(m2)
            }
        })

    return ret
}

var re_defined_id = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*define|(?:^|\uFEFF|[^$])(\bdefine\(([\'\"])[^\2]+\2)/g;

var replaceDefine = function (id, code, requires, exclude) {
    if (typeof requires == 'string') requires = [requires];

    code = replaceBOM(code);

    if (isTest(re_defined_id, code)) {
        return code;
    }

    return code.replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*define|(^|\uFEFF|[^$])(\bdefine\((?:\s*(\[[^\]]*\]){0,1}\s*,\s*){0,1})/mg, function (match, pre, fn, param) {
        if (!fn) return match;
        param = param ? JSON.parse(param.replace(/\'/g, '"')) : [];

        if (requires && requires.length) {
            param = concat(requires, param);
        }
        
        if (exclude !== true) {
            param = concat(param, parseDependencies(code));

        } else if (exclude && exclude.length) {
            for (var i = param.length - 1; i >= 0; i--) {
                if (exclude.indexOf(param[i]) != -1) {
                    param.splice(i, 1);
                }
            }
        }

        return pre + 'define(' + '"' + id + '",' + (JSON.stringify(param) + ',');
    });
}

var compressHTML = function (html) {
    return replaceBOM(html).replace(/\s*(<(\/{0,1}[a-zA-Z]+)(?:\s+[a-zA-Z1-9_-]+="[^"]*"|\s+[^\s]+)*?\s*(\/){0,1}\s*>)\s*/img, '$1')
        .replace(/<script[^>]*>([\S\s]*?)<\/script>/img, function (r0, r1) {
            return /^\s*$/.test(r1) ? r0 : ('<script>' + compressJs(r1) + '</script>');
        }).replace(/<style[^>]*>([\S\s]*?)<\/style>/img, function (r0, r1) {
            return /^\s*$/.test(r1) ? r0 : ('<style>' + compressCss(r1) + '</style>');
        });
}

var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var Promise = require('./../core/promise');

var _save = function (savePath, data, isCopy, callback) {

    var promise = new Promise();
    var dir = path.dirname(savePath);

    fs.exists(dir, function (exists) {
        if (!exists) {
            fse.mkdirs(dir, function (err, r) {
                promise.resolve(null, data);
            });
        } else {
            promise.resolve(null, data);
        }
    });

    if (isCopy) {
        promise.then([data], fs.readFile, fs);
    }

    promise.then([savePath, '$1'], fs.writeFile)
        .then(function () {
            console.log('save', savePath)
        });

    if (callback) promise.then(callback);

    return promise;
};

var save = function (savePath, data, callback) {
    return _save(savePath, data, false, callback);
};

var copy = function (sourcePath, destPath, callback) {
    return _save(sourcePath, destPath, true, callback)
}

var Tools = function (baseDir, destDir) {
    this.baseDir = baseDir;
    this.destDir = destDir;

    this.promise = new Promise().resolve();
}

Tools.prototype = {

    combine: function (pathDict) {
        var self = this;

        for (var destPath in pathDict) {
            var fileList = [],
                paths = pathDict[destPath],
                ids = [],
                isCss = /\.css$/.test(destPath),
                item;

            if (!paths.length) {
                for (var key in paths) {
                    item = paths[key] || key;
                    if (/\.(tpl|html|cshtml)$/.test(item)) {

                    } else if (!/\.js$/.test(item))
                        item += '.js';

                    fileList.push(path.join(self.baseDir, item));
                    ids.push(key);
                }

            } else {
                for (var i = 0, n = paths.length; i < n; i++) {
                    item = paths[i];

                    fileList.push(path.join(self.baseDir, isCss || /\.js$/.test(item) ? item : (item + '.js')));
                    ids.push(item);
                }
            }

            if (fileList.length) {

                (function (fileList, ids, isCss, destPath) {
                    var promise = new Promise().resolve();

                    promise.map(fileList, fs.readFile, fs)
                        .then(function (err, result) {
                            if (err) {
                                console.log(err)
                                return;
                            }

                            var text = '';

                            result.forEach(function (data, i) {
                                data = data.toString('utf-8');

                                if (/\.(tpl|html|cshtml)$/.test(fileList[i]))
                                    data = razor.web(data);

                                text += isCss ?
                                    compressCss(data) :
                                    compressJs(replaceDefine(ids[i], formatJs(data)));
                            });

                            return self.save(destPath, text);
                        });

                    self.promise.then(promise);

                })(fileList, ids, isCss, path.join(self.destDir, isCss || /\.js$/.test(destPath) ? destPath : (destPath + '.js')));

            }

        }

        return this;
    },

    html: function (fileList, api, combinedPathDict) {

        api = '<meta name="api-base-url" content="' + api + '" />';
        if (!(fileList instanceof Array)) fileList = [fileList];

        var self = this,
            now = new Date().getTime();

        fileList.forEach(function (fileName) {
            var promise = new Promise();

            fs.readFile(path.join(self.baseDir, fileName), { encoding: 'utf-8' }, function (err, html) {

                html = html.replace(/<script[^>]+debug[^>]*>[\S\s]*?<\/script>/img, '')
                    .replace(/<link[^>]+debug[^>]*\/*\s*>/img, '')
                    .replace(/<head>/i, '<head>' + api);

                if (combinedPathDict) {
                    var combinedFiles = '';
                    for (var destCombinePath in combinedPathDict) {
                        var isCss = /\.css$/.test(destCombinePath);

                        combinedFiles += isCss ? '<link href="' + destCombinePath + '?v=' + now + '" rel="stylesheet" type="text/css" />'
                            : ('<script src="' + destCombinePath + '.js?v=' + now + '"></script>');
                    }

                    combinedFiles += '<script data-template="razor" src="' + self.razorUri + '?v=' + now + '"></script>';

                    html = html.replace(/<\/head>/i, combinedFiles + '</head>');
                }

                html = compressHTML(html);

                self.save(path.join(self.destDir, fileName), html, promise.resolveSelf);
            });

            self.promise.then(promise);
        });

        return this;
    },

    resource: function (resourceDir) {

        var self = this;
        var promise = new Promise().resolve();
        var pathArr = [];

        resourceDir.forEach(function (dir, i) {
            pathArr.push([path.join(self.baseDir, dir), path.join(self.destDir, dir)]);
        });

        promise.map(pathArr, fse.copy, fse);

        this.promise.then(promise);
    },

    compress: function (fileList) {

        var self = this,
            dict;

        if (fileList.length) {
            dict = {};
            fileList.forEach(function (fileName, i) {
                dict[fileName] = '';
            });

        } else {
            dict = fileList;
        }

        for (var key in dict) {
            (function (fileName, readPath) {
                var promise = new Promise();

                if (/\.css$/.test(fileName)) {

                    fs.readFile(path.join(self.baseDir, readPath || fileName), {
                        encoding: 'utf-8'

                    }, function (err, text) {
                        self.save(path.join(self.destDir, fileName), compressCss(text), promise.resolveSelf);
                    });

                } else if (/\.html/.test(fileName)) {

                    fs.readFile(path.join(self.baseDir, readPath || fileName), {
                        encoding: 'utf-8'

                    }, function (err, text) {
                        self.save(path.join(self.destDir, fileName), compressHTML(text), promise.resolveSelf);
                    });

                } else {
                    var jsFileName = fileName + '.js';

                    fs.readFile(path.join(self.baseDir, readPath ? readPath + '.js' : jsFileName), {
                        encoding: 'utf-8'
                    }, function (err, text) {
                        if (err) console.log(path.join(self.baseDir, readPath || jsFileName));

                        text = compressJs(replaceDefine(fileName, text));

                        self.save(path.join(self.destDir, jsFileName), text, promise.resolveSelf);
                    });
                }

                self.promise.then(promise);

            })(key, dict[key]);
        }


        return this;
    },

    razorUri: 'js/razor.text.js',

    razor: function (fileList) {
        var self = this;

        var promise = new Promise().resolve();
        var result = '';

        fileList.forEach(promise.bind(function (fileName, i) {

            fs.readFile(path.join(self.baseDir, fileName + '.tpl'), {
                encoding: 'utf-8'

            }, function (err, text) {
                if (err) console.log(fileName)

                text = compressJs(replaceDefine(fileName, razor.web(replaceBOM(text))));

                result += text;

                self.save(path.join(self.destDir, 'js/' + fileName + '.js'), text, promise.resolveSelf);
            });
        }));

        self.promise.then(promise)
            .then(function () {
                return self.save(path.join(self.destDir, self.razorUri), result);
            });

        return this;
    },

    save: save,
    copy: copy,

    build: function (options) {
        options.combine && this.combine(options.combine);
        options.html && this.html(options.html, options.api, options.combine);
        options.resource && this.resource(options.resource);
        options.compress && this.compress(options.compress);
        options.razor && this.razor(options.razor);

        this.promise.then(function () {
            console.log('finish')
        });
    }
};

Tools.compressCss = compressCss;
Tools.compressHTML = compressHTML;
Tools.compressJs = compressJs;
Tools.save = save;
Tools.copy = copy;
Tools.replaceDefine = replaceDefine;
Tools.replaceBOM = replaceBOM;
Tools.formatJs = formatJs;

var rwebresource = /([^@]{0,1})@webresource\(\s*([\"|\'])([^\2]+)\2\s*\)/mg;
Tools.webresource = function (webresource, template) {
    return template.replace(rwebresource, '$1' + webresource + '$3');
};

module.exports = Tools;