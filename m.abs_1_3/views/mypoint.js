
var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('../widget/loader');
var model = require('../core/model2');
var Tab = require('../widget/tab');
var animation = require('animation');
var bridge = require('bridge');

module.exports = Activity.extend({
    events: {},

    swipeBack: '/',

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

        this.bindScrollTo(this.model.refs.main);
    },

    onShow: function () {
        var self = this;
        bridge.statusBar('dark');

        var self = this;
        var user = util.store('user');
        if (user) {
            self.user = user;

            this.loading = new Loader({
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

            }).load();

        } else {
            this.forward('/login');
        }
    },

    onPause: function () {
        bridge.statusBar('light');
    }
});
