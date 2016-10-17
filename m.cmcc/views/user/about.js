var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '关于和生活'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        Promise.all([this.waitLoad()]).then(function (results) {

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
