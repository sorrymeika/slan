define(function (require, exports, module) {
    var $ = require('$');

    if (!Object.create) Object.create = function (o) {
        var F = function () { };
        F.prototype = o;
        return new F;
    };

    if (!Object.assign) Object.assign = $.extend;

    if (!Array.isArray) Array.isArray = $.isArray;

    if (!Date.now) Date.now = function () {
        return +new Date;
    };

    window.sl = window.slan = {
        isDebug: /(^|\?|&)debug=1(?=&|$)/.test(location.search)
    };
    console.log(sl.isDebug);

    module.exports = sl;
});