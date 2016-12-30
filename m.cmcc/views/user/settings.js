var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var userModel = require('models/user');
var auth = require('logical/auth');
var user = require('logical/user');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '系统设置'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        Object.assign(model, {

            clearCache: function () {
                Toast.showToast('清除成功');
            },

            update: function () {

                user.getLatestVersion().then(function (res) {
                    if (!res || !res.data) {
                        popup.alert({
                            content: '<p class="ta_c">已经是最新版本，无需更新</p>'
                        });
                    }
                });
            },

            logout: function () {
                popup.confirm({
                    content: '<p class="ta_c">确定退出当前帐号吗</p>',
                    confirmAction: function () {
                        this.hide();

                        self.setResult('LOGOUT');

                        userModel.set(null);

                        auth.clearAuth();

                        util.store('friends', null);
                        util.store('user', null);
                        util.store('business_model', null);
                        util.store('messagesList', null);
                        util.store('device_token', null);

                        Application.back('/login');
                    }
                })
            }
        });

        Promise.all([this.waitLoad()]).then(function (results) {

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