var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loading = require('../widget/loading');
var vm = require('core/model');
var Scroll = require('../widget/scroll');
var animation = require('animation');
var Confirm = require("components/confirm");
var api = require("models/api");
var ViewModel = vm.ViewModel;


module.exports = Activity.extend({
    events: {},

    onCreate: function() {
        var self = this;

        self.model = new vm.ViewModel(this.$el, {
            title: '标题'
        });
    },

    onLoad: function() {

    },

    onShow: function() {
        var self = this;
    },

    onPause: function() {
    },

    onDestory: function() {
    }
});
