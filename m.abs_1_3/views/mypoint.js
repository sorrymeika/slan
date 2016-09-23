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

            var tIncome = this.$('.js_income').remove();

            var tab = new Tab({
                items: ["收入", "支出"]

            }).next(function () {
                console.log(this.refs.items);

                tab.append(self.razor.helpers.income(), tab.refs.items[0]);
                tab.append(self.razor.helpers.expense(), tab.refs.items[1]);
            });

            this.tab = tab;

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '积分钱包',
                points: 0.001,
                tab: tab,
                open: function () {
                    bridge.openInApp(self.user.OpenUrl || 'http://m.abs.cn');
                }
            });
            Scroll.bind(this.model.refs.main);

            tab.$el.appendTo(this.model.refs.data);
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
                            points: res.points
                        })
                        self.tab.set({
                            data: res.data
                        });
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
