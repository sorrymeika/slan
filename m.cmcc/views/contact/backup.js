var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var contact = require('logical/contact');
var bridge = require('bridge');

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;
        var loader = this.loader = new Loader(this.$el);

        var model = this.model = new Model(this.$el, {
            title: '手机通讯录查询'
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        model.backup = function() {
            loader.showLoading();

            bridge.cmcc.syncContact(0, function(res) {
                if (res.success) {
                    Toast.showToast("备份成功！");
                } else {
                    Toast.showToast(res.message);

                }
                loader.hideLoading();
            });
        }

        model.download = function() {
            var confirm = popup.confirm({
                content: '确定恢复？',
                confirmAction: function() {
                    loader.showLoading();
                    bridge.cmcc.syncContact(1, function(res) {
                        if (res.success) {
                            Toast.showToast("恢复成功！");
                        } else {
                            Toast.showToast(res.message);
                        }
                        loader.hideLoading();
                        confirm.hide();
                    });
                }
            })

        }

        loader.showLoading();

        bridge.cmcc.contactCount(function(res) {

            if (res.success) {
                model.set(res);
            }
            loader.hideLoading();
        });
    },

    onShow: function() {
        var self = this;
    },

    onDestroy: function() {
        this.model.destroy();
    }
});
