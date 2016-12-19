define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var model = require('core/model');
    var animation = require('animation');

    return Activity.extend({
        events: {},
        swipeRightBackAction: '/settings',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            this.bindScrollTo($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/settings',
                title: '隐私政策'
            });
        },

        onShow: function () {
            var that = this;
        },

        onDestroy: function () {
        }
    });
});
