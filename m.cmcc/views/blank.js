var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Scroll = require('widget/scroll');
var animation = require('animation');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '标题'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        Scroll.bind(model.refs.main);
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
