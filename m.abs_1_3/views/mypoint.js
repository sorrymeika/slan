define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
    var model = require('../core/model');
    var Scroll = require('../widget/scroll');
    var animation = require('animation');
    var bridge = require('bridge');

    return Activity.extend({
        events: {},

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '我的积分',
                open: function () {
                    bridge.openInApp(self.user.OpenUrl || 'http://m.abs.cn');
                }
            });
        },

        onShow: function () {
            var self = this;

            var self = this;
            var user = util.store('user');
            if (user) {
                self.user = user;

                this.loading = new Loading({
                    url: '/api/user/get_points',
                    check: false,
                    params: {
                        UserID: user.ID,
                        Auth: user.Auth
                    },
                    $el: this.$el,
                    success: function (res) {
                        self.model.set(res);
                    }
                });
                this.loading.load();

            } else {
                this.forward('/login');
            }
        },

        onDestory: function () {
        }
    });
});
