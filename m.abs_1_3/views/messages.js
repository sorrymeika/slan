define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model2');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');


    return Activity.extend({
        events: {},

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main, {
                refresh: function (resolve, reject) {
                    self.loading.isShowLoading = false;
                    self.loading.reload(function () {
                        self.loading.isShowLoading = true;
                        resolve();
                    });
                }
            });

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '消息中心'
            });

            this.loading = new Loading({
                url: "/api/user/get_msg",
                $el: this.$el,
                checkData: false,
                success: function (res) {
                    if (!res.data) {
                        this.showError('暂无消息');
                    }
                    self.model.set("data", res.data);
                },
                append: function (res) {
                    self.model.getModel('data').add(res.data);
                }
            });
        },

        onShow: function () {
            var self = this;

            self.user = util.store('user');

            if (!self.user) {
                self.forward('/login?success=' + this.route.url + "&from=/");
            } else {
                self.loading.setParam({
                    UserID: self.user.ID,
                    Auth: self.user.Auth
                }).load();
            }
        },

        onDestory: function () {
        }
    });
});
