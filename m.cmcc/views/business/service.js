var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var businessModel = require('models/business');
var business = require('logical/business');
var news = require('logical/news');
var newsModel = require('models/news');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var lifes = newsModel.getLifes();
        var services = newsModel.getServices();
        var groups = businessModel.getGroups();

        this.groups = groups;

        var model = this.model = new Model(this.$el, {
            title: '服务大厅',
            lifes: lifes,
            services: services
        });

        model.delegate = this;

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        this.syncUnread = this.syncUnread.bind(this);

        groups.observe(this.syncUnread);

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([news.getLifes(), news.getServices()]).then(function (results) {
            self.syncUnread();

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
    },

    openUrl: function (linkurl) {
        if (/^\d+$/.test(linkurl)) {
            linkurl = 'b' + linkurl;
        }
        business.redirect.jump(linkurl);
    },

    syncUnread: function () {
        var list = this.groups.get('type1data.list').concat(this.groups.get('type2data.list'));
        var checkFn = function (newsItem, item) {
            return newsItem.summary == item.business_id ? {
                unread: item.unread

            } : null;
        }

        this.model._('lifes').update(false, list, checkFn);
        this.model._('services').update(false, list, checkFn);
    },

    onDestroy: function () {

        this.groups.removeObserve(this.syncUnread);
        this.model.destroy();
    }
});