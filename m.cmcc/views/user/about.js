var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var news = require('logical/news');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '关于'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        Promise.all([news.getCategoryAllNews(5), this.waitLoad()]).then(function (results) {
            var res = results[0];

            model.set({
                data: res.data[0]
            })

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
        this.model.destroy();
    }
});
