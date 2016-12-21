﻿var http = require('http');
var _ = require('underscore');

module.exports = function (host, port, replace) {

    return function (request, response) {
        var url = replace ? replace(request.url) : (request.params[0].indexOf('/') !== 0 ? '/' + request.params[0] : request.params[0]);

        var options = {
            hostname: host,
            port: port,
            path: url,
            method: request.method,
            headers: _.extend({}, request.headers, { host: host + ":" + port })
        };

        var isDebug = false;

        var log = isDebug ? console.log : function () { }

        log(url, options);

        var req = http.request(options, function (res) {
            log(request.headers.origin);

            response.set(res.headers);
            //response.set('Access-Control-Allow-Credentials', true);
            response.set('Access-Control-Allow-Origin', request.headers.origin);

            res.on('data', function (chunk) {
                log(2);
                response.write(chunk);
            });

            res.on('end', function () {
                log(3);
                response.end();
            });
        });

        req.on('error', function (e) {
            log(e);
            response.end();
        });

        request.on('data', function (postData) {
            log(4);
            req.write(postData);
        });

        request.on('end', function () {
            log(5);
            req.end();
        });

    };
}