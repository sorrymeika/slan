var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loader');
var model = require('core/model');
var animation = require('animation');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.swipeBack = self.route.query.from || '/settings';

        this.bindScrollTo($main);

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeBack,
            title: '修改密码'
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
    }
});
