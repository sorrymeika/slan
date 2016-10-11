var Promise = require('promise');
var Http = require('core/http');
var Loader = require('widget/loader');

var util = require('util');

var quan = {

    Loader: Loader.extend({
        url: '/quan/getall'
    }),

    getMessages: function () {


    }
}

module.exports = quan;