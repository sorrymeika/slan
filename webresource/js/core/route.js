var util = require('util');

var Route = function (options) {
    this.routes = [];
    this.append(options);
};

Route.formatUrl = function (hash) {
    var searchIndex = hash.indexOf('?');
    var search = '';
    if (searchIndex != -1) {
        search = hash.substr(searchIndex);
        hash = hash.substr(0, searchIndex);
    }
    return (hash.replace(/^#+|\/$/, '') || '/') + search;
}

Route.compareUrl = function (a, b) {

    return this.formatUrl(a).toLowerCase() == this.formatUrl(b).toLowerCase();
}

Route.prototype.append = function (options) {
    var option,
        parts,
        root,
        namedParam,
        regex;

    for (var key in options) {
        option = options[key];
        parts = [];

        regex = '^(?:\/{0,1})' + key.replace(/(\/|^|\?)\{((?:\{[^\}]+\}|.){0,}[^\}]*)\}/g, function (match, first, param) {
            namedParam = param.split(':');

            if (namedParam.length > 1) {
                parts.push(namedParam.shift());
                param = namedParam.join(':');
            }
            return first + '(' + param + ')';

        }) + '$';

        if (typeof option === 'string')
            throw new Error('Route options error');

        root = option.root || './';

        this.routes.push({
            regex: new RegExp(regex, 'i'),
            parts: parts,
            template: util.combinePath(root, option.template),
            view: util.combinePath(root, option.controller),
            api: option.api,
            root: root
        });
    }
}

Route.prototype.match = function (url) {
    var result = null,
        query = {},
        hash = url = Route.formatUrl(url),
        index = url.indexOf('?'),
        search,
        routes = this.routes,
        route,
        match;

    if (index != -1) {
        search = url.substr(index + 1);

        url = url.substr(0, index);

        search.replace(/(?:^|&)([^=&]+)=([^&]*)/g, function (r0, r1, r2) {
            query[r1] = decodeURIComponent(r2);
            return '';
        })
    } else {
        search = '';
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
                package: sl.isDebug ? false : util.combinePath(route.root, 'controller'),
                view: route.view,
                params: {},
                search: search,
                query: query,
                data: {}
            };

            for (var j = 0, len = route.parts.length; j < len; j++) {
                result.params[route.parts[j]] = match[j + 1];
            }

            if (route.api) {
                result.api = route.api.replace(/\{([^\}]+?)\}/g, function (match, key) {
                    return result.params[key];
                });
            }
            break;
        }
    }

    if (!result) {
        console.error('wrong url:', url);
    }

    return result;
}

module.exports = Route;