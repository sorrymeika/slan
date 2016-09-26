define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loader');
    var model = require('../core/model2');
    var Scroll = require('../widget/scroll');
    var Tab = require('../widget/tab');
    var animation = require('animation');
    var bridge = require('bridge');

    return Activity.extend({
        events: {},

        swipeRightBackAction: '/',

        onCreate: function () {
            var self = this;

            this.model = new model.Model(this.$el, {
                back: '/',
                title: '积分钱包',
                points: 0.001,
                open: function () {
                    bridge.openInApp(self.user.OpenUrl || 'http://m.abs.cn');
                }
            });

            Scroll.bind(this.model.refs.main);
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
                        self.model.set({
                            points: res.points,
                            data: res.data
                        })
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
