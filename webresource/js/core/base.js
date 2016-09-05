define(function (require, exports, module) {
    var $ = require('$');

    if (!Object.create) Object.create = function (o) {
        var F = function () { };
        F.prototype = o;
        return new F;
    };

    if (!Object.assign) Object.assign = $.extend;

    if (!Date.now) Date.now = function () {
        return +new Date;
    };

    window.sl = window.slan = {};

    module.exports = sl;
});