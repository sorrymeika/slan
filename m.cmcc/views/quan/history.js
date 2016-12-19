var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Toast = require('widget/toast');
var popup = require('widget/popup');
var Model = require('core/model2').Model;
var Promise = require('promise');

var quan = require('logical/quan');
var user = require('models/user');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '我的历史'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        model.date = function (date) {

            return "<b>今天</b>";
        }

        model.del = function (msg_id) {

            popup.confirm({
                title: '温馨提醒',
                content: '您确定要删除吗',
                confirmText: "确定",
                confirmAction: function () {
                    var pop = this;

                    Loader.showLoading();

                    quan.deleteQuan(msg_id).then(function () {

                        pop.hide();

                        model.getModel('data').remove('msg_id', msg_id);

                    }).catch(function (e) {
                        Toast.showToast(e.message);

                    }).then(function () {
                        Loader.hideLoading();
                    });
                },
                cancelText: "取消",
                cancelAction: function () { }
            })
        }

        Promise.all([quan.getHistory(), this.waitLoad()]).then(function (results) {

            var res = results[0];

            model.set({
                data: res.data
            })

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
