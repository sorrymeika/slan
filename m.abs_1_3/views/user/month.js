
var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Slider = require('widget/slider');
var Model = require('core/model2').Model;
var Scroll = require('widget/scroll');
var Toast = require('widget/toast');
var Tab = require('widget/tab');

var user = require('logical/user');

return Activity.extend({
    events: {
        'tap .js_canget': function (e) {
            this.forward('/news/month' + $(e.currentTarget).attr('data-id') + '?from=' + encodeURIComponent(this.route.url));
        }
    },

    loadUserInfo: function () {
        var self = this;
        var total = Math.round(this.user.Amount);
        var percent = 1;
        var level;
        var nextLevel;
        var currentLevel;
        var levelAmounts;
        var levels = ['银卡会员', '金卡会员', '钻石会员', 'VIP会员', 'SVIP会员', '无敌会员'];

        self.model.set('vip', total < (levelAmounts = 1000) ? (level = 0, nextLevel = 1000 - total, levels[1]) : total < (levelAmounts = 5000) ? (level = 1, nextLevel = 5000 - total, levels[2]) : total < (levelAmounts = 10000) ? (level = 2, nextLevel = 10000 - total, levels[3]) : total < (levelAmounts = 50000) ? (level = 3, nextLevel = 50000 - total, levels[4]) : (level = 4, nextLevel = '0', levels[5]));

        percent = Math.min(1, total / levelAmounts);

        self.model.set({
            energy: total,
            nextLevel: nextLevel,
            currentLevel: levels[level],
            levelAmounts: levelAmounts,
            energyPercent: percent * 100 + '%',
            ucCardAmounts: util.formatMoney(total) + (total > 50000 ? '' : ('/' + util.formatMoney(levelAmounts)))
        });
    },

    onCreate: function () {
        var self = this;
        self.user = util.store('user');

        this.model = new Model(this.$el, {
            title: '我的月礼',
            back: this.swipeRightBackAction,
            user: self.user
        });
        Scroll.bind(this.model.refs.main);

        this.loadUserInfo();
    },

    onShow: function () {
        var self = this;
        var model = this.model;

        user.getMonth(function (err, res) {

            if (err) {
                Toast.showToast(err.msg);
                return;
            }

            model.set({
                data: res.data,
                hasNextMonthGift: res.hasNextMonthGift,
                products: [{
                    PRD_NAME:'test',
                    PRD_PRICE: 99.9
                }]
            })

            if (res.data.FRE_ID) {
                user.getMonthGifts(res.data.FRE_ID, function (err, res) {

                    if (err) {
                        Toast.showToast(err.msg);
                        return;
                    }
                    model.set({
                        products: res.data
                    });

                }, self.$el);
            }

        }, this.$el);
    },

    onDestory: function () {
    }
});