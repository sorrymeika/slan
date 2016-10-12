
var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Model = require('core/model2').Model;
var Toast = require('widget/toast');
var Tab = require('widget/tab');

var Size = require('components/size');

var user = require('logical/user');
var product = require('logical/product');
var bridge = require('bridge');

module.exports = Activity.extend({

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

    getGift: function (item) {
        var self = this;

        this.size.set({
            data: item

        }).show();

        product.getSizeByPrhId(item.PRH_ID, function (err, res) {

            if (err) {
                Toast.showToast(err.msg);
                return;
            }

            var color = [];
            var spec = [];
            for (var i = 0, len = res.data.length; i < len; i++) {
                var item = res.data[i];

                if (util.indexOf(self.model.data.products, function (record) {
                    return (record.PRD_ID == item.PRD_ID)
                }) != -1) {
                    if (color.indexOf(item.PRD_COLOR) == -1) {
                        color.push(item.PRD_COLOR);
                    }
                    if (spec.indexOf(item.PRD_SPEC) == -1) {
                        spec.push(item.PRD_SPEC);
                    }
                }

            }

            var data = self.size.data.data;
            var item = util.first(res.data, function (item) {
                return item.PRD_ID == data.PRD_ID;
            });

            self.size.set({
                freid: self.route.params.id,
                type: "month",
                color: color,
                spec: spec,
                colorSpec: res.data,
                data: item,
                qty: 1
            });

        }, $('body'));

    },

    onCreate: function () {
        var self = this;
        self.user = util.store('user');

        this.model = new Model(this.$el, {
            title: '我的月礼',
            back: this.swipeRightBackAction,
            user: self.user
        });

        this.model.getGift = this.getGift.bind(this);

        this.bindScrollTo(this.model.refs.main);

        this.loadUserInfo();

        this.size = new Size();

        this.size.$el.appendTo($('body'));
    },

    onShow: function () {
        var self = this;
        var model = this.model;

        bridge.statusBar('dark');

        user.getMonth(function (err, res) {

            if (err) {
                Toast.showToast(err.msg);
                return;
            }

            model.set({
                data: res.data,
                hasNextMonthGift: res.hasNextMonthGift
            })

            if (res.data.FRE_ID) {
                user.getMonthGifts(res.data.FRE_ID, function (err, res) {

                    if (err) {
                        Toast.showToast(err.msg);
                        return;
                    }

                    var result = [];
                    for (var i = 0; i < res.data.length; i++) {
                        if (util.indexOf(result, function (item) {
                            return item.PRH_ID == res.data[i].PRH_ID;
                        }) == -1) {
                            result.push(res.data[i]);
                        }
                    }
                    model.set({
                        list: result,
                        products: res.data
                    });

                }, self.$el);
            }

        }, this.$el);
    },

    onPause: function () {
        bridge.statusBar('light');
    },

    onDestory: function () {
    }
});