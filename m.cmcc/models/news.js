var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var NEWS_LIFE_CACHE = 'NEWS_LIFE_CACHE';
var NEWS_SERVICES_CACHE = 'NEWS_SERVICES_CACHE';

var news = vm.createModel({
    defaultData: {
        catalogs: [],
        banners: [],
        lifes: util.store(NEWS_LIFE_CACHE) || [],
        services: util.store(NEWS_SERVICES_CACHE) || []
    },
    getServices: function () {
        return this._('services')
    },
    getLifes: function () {
        return this._('lifes')
    }
});

news.observe('lifes', function () {

    util.store(NEWS_LIFE_CACHE, this.get('lifes'));
});

news.observe('services', function () {

    util.store(NEWS_SERVICES_CACHE, this.get('services'));
});


module.exports = news;