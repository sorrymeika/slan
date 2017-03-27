var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model');
var animation = require('animation');

module.exports = Activity.extend({
    events: {
        'tap .js_back': function () {
            this.back(this.swipeBack);
        }
    },

    onCreate: function () {
        var self = this;

        self.model = new model.ViewModel(this.$el, {
            title: '标题'
        });

        this.bindScrollTo(self.model.refs.main);
    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
    }
});
