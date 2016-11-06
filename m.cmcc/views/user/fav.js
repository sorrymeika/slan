var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var userLogical = require('logical/user');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '我的收藏'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        model.del = function (id) {
            userLogical.delFav(id).then(function () {
                model._("data").remove("fav_id", id);
            }).catch(function (e) {
                Toast.showToast(e.message);
            });
        }

        Loader.showLoading();

        Promise.all([userLogical.getFav(), this.waitLoad()]).then(function (results) {

            model.set({
                data: results[0].data
            })

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            Loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
