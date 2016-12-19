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

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '我的消息'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.clear = function () {
            popup.confirm({
                title: '温馨提示',
                content: '确认清除消息？',
                confirmText: '确定删除',
                confirmAction: function () {
                    this.hide();
                    model.set({
                        messages: [],
                        sysmessages: []
                    })
                },
                cancelText: '取消',
                cancelAction: function () {
                }
            })

        }

        model.on('viewDidUpdate', function () {
            if (this.data.type == 1 && !model.refs.system.scroll)
                self.bindScrollTo(model.refs.system);
        })

        Promise.all([user.getMessages(), user.getMessages('system'), this.waitLoad()]).then(function (results) {

            model.set({
                messages: results[0].data,
                sysmessages: results[1].data
            })

            self.bindScrollTo(model.refs.messages);

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
