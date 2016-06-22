var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model');
var Scroll = require('widget/scroll');
var animation = require('animation');

module.exports = Activity.extend({
    events: {
        'tap .js_back': function () {
            this.back(this.swipeRightBackAction);
        }
    },

    onCreate: function () {
        var self = this;

        self.model = new model.ViewModel(this.$el, {
            title: '标题'
        });

        Scroll.bind(self.model.refs.main);
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
