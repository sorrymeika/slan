define(function (require, exports, module) {
    var $ = require('$');

    if (!Object.create) Object.create = function (o) {
        var F = function () { };
        F.prototype = o;
        return new F;
    };

    if (!Object.assign) Object.assign = $.extend;

    if (!Array.isArray) Array.isArray = $.isArray;

    if (Array.prototype.map) Array.prototype.map = function (fn) {
        return $.map(this, fn);
    }


    if (!Date.now) Date.now = function () {
        return +new Date;
    };

    if (!Object.keys) {
        Object.keys = (function () {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function (obj) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        } ());
    }

    window.sl = window.slan = {
        isDev: /(^|\?|&)debug=1(?=&|$)/.test(location.search)
    };

    module.exports = sl;
});