define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Activity = require('activity'),
        bridge = require('bridge'),
        model = require('core/model');
    var Loading = require('../widget/loader');

    return Activity.extend({
        toggleAnim: 'menu',
        className: 'menu',
        events: {
            'tap': function (e) {
            },
            'tap [data-logout]': function (e) {
            }
        },

        swipeLeftBackAction: '/',

        onCreate: function () {
            var self = this;

            this.bindScrollTo(this.$('.menu_bd'));

            if (bridge.hasStatusBar) {
                this.$el.find('.fix_statusbar').addClass("fix_statusbar");
            }

            this.model = new model.ViewModel(this.$el, {
            });
            this.onShow();
        },

        onShow: function () {
            var self = this;

            var user = util.store('user');
            if (user) {
                this.user = user;
                this.model.set({
                    memberUrl: '/member',
                    logoutOrLogin: '退出',
                    user: user
                });

            } else {
                this.model.set({
                    memberUrl: '/login',
                    logoutOrLogin: '登录',
                    user: null
                });
            }
        },

        onDestroy: function () {
        }
    });
});
