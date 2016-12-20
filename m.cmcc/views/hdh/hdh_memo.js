var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var hdh = require('logical/hdh');
var hdhModel = require('models/hdh');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var subphone = this.route.params.subphone;
        var loader = this.loader = new Loader(this.$el);

        var alias = this.route.query.alias;

        var model = this.model = new Model(this.$el, {
            title: '副号别名',
            text: alias,
            origin: alias
        });

        model.save = function () {
            loader.showLoading();

            var alias = this.get('text');

            hdh.setAlias(subphone, alias).then(function () {
                Toast.showToast("修改成功！");
                model.back();

            }).catch(function (e) {
                Toast.showToast(e.message);

            }).then(function () {
                loader.hideLoading();
            });
        }

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }
    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
        this.model.destroy();
    }
});