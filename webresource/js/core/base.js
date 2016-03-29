define(function (require, exports, module) {
    if (!Object.create) Object.create = function (o) {
        var F = function () { };
        F.prototype = o;
        return new F;
    };

    if (!Date.now) Date.now = function () {
        return +new Date;
    };

    window.sl = window.slan = {};

    module.exports = sl;
});