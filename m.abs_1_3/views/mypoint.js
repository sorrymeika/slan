define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('../widget/loading');
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

            var $main = this.$('.main');

            Scroll.bind($main);

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '我的积分',
                open: function () {
                    bridge.openInApp(self.user.OpenUrl || 'http://m.abs.cn');
                }
            });

            var tab = new Tab({
                items: ["收入", "支出"]
            });

            tab.next(function () {

                console.log(this.refs.items);

                tab.appendTo('<div>xxxxx</div>', tab.refs.items[0])
            });


            tab.$el.appendTo(this.model.refs.main);
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
                //this.loading.load();

            } else {
                this.forward('/login');
            }
        },

        onDestory: function () {
        }
    });
});
