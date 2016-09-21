var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var api = require('models/api');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        this.model = new model.ViewModel(this.$el, {
            title: '标题'
        });

        this.model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        Scroll.bind(this.model.refs.main);
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
