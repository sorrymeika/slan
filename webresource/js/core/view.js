define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Component = require('./component'),
        slice = Array.prototype.slice;

    var View = function () {
        var that = this,
            options,
            args = slice.call(arguments),
            selector = args[0];

        if ($.isPlainObject(selector)) {
            options = selector;
        } else {
            options = args[1] || {};
            options.el = args.shift();
        }

        Component.apply(this, args);

        that.initialize.apply(that, args);

        if (that.options.initialize) that.options.initialize.apply(that, args);
    };
    
    View.prototype = $.extend({}, Component.prototype);

    View.extend = function (options) {
        var child = util.extend.call(this, options);

        child.prototype.events = $.extend({}, child.__super__.events, child.prototype.events);

        return child;
    };

    module.exports = View;
});