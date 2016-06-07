var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.swipeRightBackAction = self.route.query.from || '/settings';

        Scroll.bind($main);

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '修改密码'
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
