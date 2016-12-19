var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Model = require('core/model2').Model;
var animation = require('animation');

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '使用协议'
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        model.agree = function() {
            self.setResult('agree_licence');
            this.back();
        }

        this.bindScrollTo(model.refs.main);
    },

    onShow: function() {
        var self = this;
    },

    onDestroy: function() {
        this.model.destroy();
    }
});