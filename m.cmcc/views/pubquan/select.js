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
            title: '选择公众圈'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.selectItem = function (item) {
            this._('list').each(function (mod) {

                if (mod.get('quan_id') != item.quan_id) {
                    mod.set('isSelected', false)
                } else {
                    mod.set('isSelected', true)
                }
            });
        }

        model.save = function () {
            var list = this.data.list;

            self.back(self.swipeRightBackAction, {
                list: util.filter(list, 'isSelected', true).map(function (item) {
                    return item;
                })
            })
        }

        var loader = this.loader = new Loader(this.$el);
        var routeData = this.route.data;

        console.log(routeData);

        loader.showLoading();

        Promise.all([publicquan.myfollow(), this.waitLoad()]).then(function (results) {
            var list = results[0].data;

            if (routeData.list)
                list.forEach(function (item) {
                    item.isSelected = util.indexOf(routeData.list, 'quan_id', item.quan_id) == -1;
                });

            model.set({
                list: list
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
    },

    onDestroy: function () {
        this.model.destroy();
    }
});
