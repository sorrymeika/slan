
var $ = require('$');
var util = require('util');
var Promise = require('promise');
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
        var freId = item.freId;

        this.size.set({
            data: item

        }).show();

        product.getSizeByPrhId(item.PRH_ID, function (res) {

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
                    var prdSpec = util.formatProdSpec(item);
                    if (spec.indexOf(prdSpec) == -1) {
                        spec.push(prdSpec);
                    }
                }

            }

            var data = self.size.data.data;
            var item = util.first(res.data, function (item) {
                return item.PRD_ID == data.PRD_ID;
            });

            self.size.set({
                freid: freId,
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

    filterGifts: function (data) {

        var result = [];
        for (var i = 0; i < data.length; i++) {
            if (util.indexOf(result, function (item) {
                return item.PRH_ID == data[i].PRH_ID;
            }) == -1) {
                result.push(data[i]);
            }
        }

        return result;
    },

    onShow: function () {
        var self = this;
        var model = this.model;

        bridge.statusBar('dark');

        user.getMonthOverdue().then(function (res) {

            if (!res.data) return null;

            return Promise.all(res.data.map(function (item) {

                return new Promise(function (resolve) {

                    user.getMonthGifts(item.freId, function (res) {

                        res.data.forEach(function (prd) {
                            prd.Year = item.Year;
                            prd.Month = item.Month;
                        });
                        resolve(res.data);
                    })
                })
            }));

        }).then(function (results) {

            var arr = [];
            results.forEach(function (data) {
                arr = arr.concat(data);
            });

            results = self.filterGifts(arr);
            console.log(results);

            model.set({
                overdue: results
            })
        });

        user.getMonthGot().then(function (res) {

            if (!res.data) return null;

            return Promise.all(res.data.map(function (item) {

                return new Promise(function (resolve) {

                    user.getMonthGifts(item.freId, function (res) {
                        res.data.forEach(function (prd) {
                            prd.Year = item.Year;
                            prd.Month = item.Month;
                        });
                        resolve(res.data);
                    })
                })
            }));

        }).then(function (results) {

            var arr = [];
            results.forEach(function (data) {
                arr = arr.concat(data);
            });

            results = self.filterGifts(arr);

            model.set({
                got: results
            })
        });

        user.getMonth(function (res) {

            model.set({
                data: res.data,
                hasNextMonthGift: res.hasNextMonthGift
            });

            if (res.data && res.data.FRE_ID) {
                var freId = res.data.FRE_ID;
                user.getMonthGifts(res.data.FRE_ID, function (res) {

                    res.data.forEach(function (item) {
                        item.freId = freId;
                    });

                    console.log(res.data);

                    model.set({
                        list: self.filterGifts(res.data),
                        products: res.data
                    });

                }, self.$el);
            }

        }, this.$el);
    },

    onPause: function () {
        bridge.statusBar('light');
    },

    onDestroy: function () {
    }
});