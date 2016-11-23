var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var user = require('logical/user');

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;
        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        var model = this.model = new Model(this.$el, {
            title: '隐私设置'
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        model.update = function(key) {
            var value = this.get(key);
            value = value == 1 ? 2 : 1;
            loader.showLoading();

            this.set(key, value);

            user.updateExt(key, value).catch(function(e) {
                Toast.showToast(e.message);

            }).then(function() {
                loader.hideLoading();
            });
        }

        Promise.all([user.getPrivacy(), this.waitLoad()]).then(function(results) {
            var result = results[0];

            model.set(result.data);

            self.bindScrollTo(model.refs.main);

        }).catch(function(e) {
            Toast.showToast(e.message);
        }).then(function() {
            loader.hideLoading();
        });
    },

    onShow: function() {
        var self = this;
    },

    onDestory: function() {
        this.model.destroy();
    }
});