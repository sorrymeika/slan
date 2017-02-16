var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var business = require('logical/business');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '提醒设置'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        Promise.all([business.getBusinessWithSettings(), this.waitLoad()]).then(function (results) {

            var data = util.groupBy('type', results[0].data);

            console.log(data);

            var map = {
                1: '移动提醒',
                2: '生活提醒',
                3: '娱乐提醒',
                4: '社交提醒'
            }

            data.forEach(function (typeData) {
                typeData.name = map[typeData.key.type];
            })

            model.set({
                data: data
            });

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
