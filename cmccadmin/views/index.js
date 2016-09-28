define(function(require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('core/page');
    var Form = require('components/form');
    var Grid = require('components/grid');

    return Page.extend({
        events: {},

        onCreate: function() {
            var self = this;

            this.model = new model.ViewModel(this.$el, {});
        },

        onShow: function() {
        }
    });
});
