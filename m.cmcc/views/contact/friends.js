var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var firstLetter = require('util/firstLetter');

var contact = require('logical/contact');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '我的好友',
            letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([contact.friends(), this.waitLoad()]).then(function (results) {

            console.log(results);

            var data = results[0].data;

            var groups = {};

            data.forEach(function (item) {
                var letter = firstLetter(item.user_name).charAt(0).toUpperCase();

                if (!groups[letter]) {
                    groups[letter] = [];
                }

                groups[letter].push(item);
            });

            groups = Object.keys(groups).map(function (key) {

                return {
                    letter: key,
                    list: groups[key]
                };
            });

            model.set({
                groups: groups
            });
            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
