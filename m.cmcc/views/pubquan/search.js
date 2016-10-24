var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var publicquan = require('logical/publicquan');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.refs.searchform.onsubmit = function () {
            if (model.data.search) {

                publicquan.search(model.data.search)
                    .then(function (res) {
                        model.set({
                            isSearch: true,
                            searchResult: res.data
                        })

                    }).catch(function (e) {
                        Toast.showToast(e.message);
                    });

            }
            return false;
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([publicquan.recommend(), this.waitLoad()]).then(function (results) {

            model.set({
                recommend: results[0].data
            })

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
        this.model.refs.search.focus();
    },

    onDestory: function () {
        this.model.destroy();
    }
});
