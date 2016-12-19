var util = require('util');
var Promise = require('promise');
var bridge = require('bridge');
var Http = require('core/http');
var userModel = require('models/user');
var auth = require('logical/auth');
var Loader = require('widget/loader');

var newsModel = require('models/news');

var news = {

    getHomeBanner: function () {

        return this.getNewsByCategoryId(1);
    },

    getNewsByCategoryId: function (categoryId) {
        return Http.post('/news/getNewsByCategoryId', {
            categoryId: categoryId
        });
    },

    getLifes: function () {

        return this.getNewsByCategoryId(2).then(function (res) {
            var collection = newsModel.getLifes();

            collection.update(res.data, 'news_id', true);

            return collection;
        });
    },

    getServices: function () {

        return this.getNewsByCategoryId(3).then(function (res) {
            var collection = newsModel.getServices();

            collection.update(res.data, 'news_id', true);

            return collection;
        });
    }
}

module.exports = news;