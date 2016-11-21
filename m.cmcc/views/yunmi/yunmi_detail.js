var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var ym = require('logical/yunmi');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '云米交易明细'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([ym.getYunmiDetails(), this.waitLoad()]).then(function (results) {
            var res = results[0];



            var data = util.groupBy('day,sum(amount)', res.data.map(function (item) {
                item.day = util.formatDate(item.trade_date, 'yy-M-d W');
                return item;
            }));

            console.log(data);

            model.set({
                amount: res.amount,
                data: data,
                ym_get: util.sum(res.data, function (item) {
                    return item.amount > 0 ? item.amount : 0;
                }),
                ym_use: util.sum(res.data, function (item) {
                    return item.amount < 0 ? item.amount : 0;
                })
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
