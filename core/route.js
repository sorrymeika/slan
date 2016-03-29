var standardizeHash = function (hash) {
    var searchIndex = hash.indexOf('?');
    if (searchIndex != -1) {

    }
    return (hash.replace(/^#+|\/$/, '') || '/').toLowerCase();
};

var Route = function (options, isDebug) {
    var routes = [],
        option,
        parts,
        root,
        rootPath,
        namedParam,
        regex;

    for (var key in options) {
        option = options[key];
        parts = [];

        regex = '^(?:\/{0,1})' + key.replace(/(\/|^|\?)\{((?:.+?\{[^\}]+\}){0,}[^\}]*)\}/g, function (match, first, param) {
            namedParam = param.split(':');

            if (namedParam.length > 1) {
                parts.push(namedParam.shift());
                param = namedParam.join(':');
            }

            return first + '(' + param + ')';
        }) + '$';

        if (typeof option === 'string')
            throw new Error('Route options error');

        root = option.root || '/';
        rootPath = (root != '/' ? root.replace(/^\//, '') + '/' : '');

        routes.push({
            regex: new RegExp(regex, 'i'),
            parts: parts,
            template: rootPath + option.template,
            view: rootPath + option.controller,
            api: option.api,
            root: root
        });
    }

    this.isDebug = isDebug !== false;
    this.routes = routes;
};

Route.prototype.match = function (url) {
    var result = null,
        queries = {},
        hash = url = standardizeHash(url),
        index = url.indexOf('?'),
        query,
        routes = this.routes,
        route,
        match;

    if (index != -1) {
        query = url.substr(index + 1);

        url = url.substr(0, index);

        query.replace(/(?:^|&)([^=&]+)=([^&]*)/g, function (r0, r1, r2) {
            queries[r1] = decodeURIComponent(r2);
            return '';
        })
    } else {
        query = '';
    }

    for (var i = 0, length = routes.length; i < length; i++) {
        route = routes[i];

        match = route.regex ? url.match(route.regex) : null;

        if (match) {
            result = {
                path: match[0],
                url: hash,
                hash: '#' + hash,
                root: route.root,
                template: route.template,
                package: this.isDebug ? false : (route.root == '/' ? 'controller' : (route.root.replace(/^\//, '') + '/controller')),
                view: route.view,
                data: {},
                queryString: query,
                query: queries,
                queries: queries
            };

            for (var j = 0, len = route.parts.length; j < len; j++) {
                result.data[route.parts[j]] = match[j + 1];
            }

            if (route.api) {
                result.api = route.api.replace(/\{([^\}]+?)\}/g, function (match, key) {
                    return result.data[key];
                });
            }
            break;
        }
    }

    return result;
}

Route.standardizeHash = standardizeHash;

module.exports = Route;