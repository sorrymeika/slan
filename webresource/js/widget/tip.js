define(function (require, exports) {

    var $ = require('$'),
        util = require('util'),
        Promise = require('core/promise');

    var $el = $('<div class="tip" style="display:none"></div>')
        .on($.fx.transitionEnd, function () {
            if ($el.hasClass('tip-hide')) {
                $el.hide();
            }
        })
        .appendTo(document.body),
        timer;

    exports.promise = Promise.resolve();

    exports.msec = 2000;

    exports.show = function () {
        if (!$el.hasClass('tip-show'))
            $el.removeClass('tip-hide').show().addClass('tip-show');
    }

    exports.msg = function (msg) {
        var self = this;

        self.promise.then(function () {
            $el.html(msg);
            self.show();

            setTimeout(function () {

                self.hide();

                self.promise.resolve();

            }, self.msec);

            return this;
        })
    }

    exports.hide = function () {
        $el.removeClass('tip-show').addClass('tip-hide');
    }

    sl.tip = function (msg) {
        exports.msg(msg);
    };
});