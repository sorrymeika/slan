var util = require('util');
var Promise = require('promise');
var bridge = require('bridge');
var Http = require('core/http');
var userModel = require('models/user');
var auth = require('logical/auth');
var Loader = require('widget/loader');

var news = {

    getHomeBanner: function () {

        return this.getNewsByCategoryId(1);
    },

    getNewsByCategoryId: function (categoryId) {
        return Http.post('/news/getNewsByCategoryId', {
            categoryId: categoryId
        });
    }
}

module.exports = news;