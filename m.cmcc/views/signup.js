var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
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

        this.bindScrollTo(model.refs.main);

        this.waitLoad(function () {
        })
    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
        this.model.destroy();
    }
});
