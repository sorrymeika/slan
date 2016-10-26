
var $ = require('$');
var util = require('util');
var Model = require('core/model2').Model;
var Page = require('core/page');
var Http = require('core/http');
var Form = require('components/form');
var Grid = require('components/grid');

return Page.extend({
    events: {},

    onCreate: function () {
        var self = this;

        this.model = new Model(this.$el, {});

        new Http({
            url: '/user/test'

        }).request();
    },

    onShow: function () {
    }
});
