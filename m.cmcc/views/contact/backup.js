var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var contact = require('logical/contact');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '手机通讯录查询'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.backup = function () {
            contact.backup().then(function () {
                Toast.showToast("备份成功！");

            }).catch(function (e) {
                Toast.showToast(e.message);
            });
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([this.waitLoad()]).then(function (results) {


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

    onDestroy: function () {
        this.model.destroy();
    }
});
