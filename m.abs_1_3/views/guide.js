define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model');
    var Scroll = require('widget/scroll');
    var animation = require('animation');

    return Activity.extend({
        events: {
            'tap .js_bind:not(.disabled)': function () {

            }
        },
        swipeRightBackAction: '/settings',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/settings',
                title: '新手指南'
            });
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
