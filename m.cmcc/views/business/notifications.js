var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var bridge = require('bridge');

var business = require('logical/business');
var businessModel = require('models/business');

var user = require('models/user');
var appconfig = require('models/appconfig');

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;
        var business_id = this.business_id = this.route.params.id;
        var dataModel = businessModel._('list').find('business_id', business_id);

        var model = this.model = new Model(this.$el, {
            business_id: business_id,
            title: dataModel.get('business_name'),
            business: dataModel,
            hasFooter: [100001, 100003, 100002, 100004, 100005, 100026, 100022, 100043, 100045, 100046, 100044].indexOf(parseInt(business_id)) != -1
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        Object.assign(model, business.redirect);


        model.goToDetail = function(item) {
            this.jump(item.linkurl);
        }

        model.enterDetail = function() {
            switch (business_id) {
                case '100001':
                    this.enterShop();
                    break;
            }
        }

        model.enterBackup = function() {
            self.forward('/contact/backup');
        }

        model.enterWaterBill = function() {
            self.forward('/life/bill/' + business_id);
        }

        model.enterElecBill = function() {
            self.forward('/life/bill/' + business_id);
        }

        var loader = this.loader = business.notificationsLoader(model, function(res) {

            switch (business_id) {
                //移动业务
                case '100001':
                    res.data.forEach(function(item) {
                        if (item.type == -1) {
                            return;
                        }

                        var details = item.details = [];
                        var feature = JSON.parse(item.feature);

                        if (feature.dun_type) {
                            // 1. 余额提醒
                            // 2. 欠费提醒
                            // 3. 虚拟月出账余额提醒
                            // 4. 虚拟月出账欠费提醒
                            // 5. 停机提醒
                            // 6. 月出帐用户提醒
                            // 7. 虚拟月出账托收用户提醒
                            // 8. 虚拟月出账托收用户经办人提醒
                            // 9. 关怀缴费提醒
                            // 15. 延迟停机提醒
                            // 20. 集团余额提醒
                            // 21. 集团欠费提醒
                            // 101. 单停提醒
                            // 103. 单停通知
                            // 104. 单停信用期到期提醒
                            // 105. 单停信用期到期提醒
                            switch (feature.dun_type) {
                                case '1':
                                case '2':
                                case '5':
                                case '20':
                                case '21':
                                    break;
                            }

                            var is_nofee = feature.useble_balance == 0;

                            item.title = is_nofee ? '话费欠费提醒' : '话费不足提醒';
                            details.push({
                                text: is_nofee ? '您的手机已欠费' : '您的话费剩余已不多',
                                value: '-'
                            }, {
                                    text: '手机号码',
                                    value: user.get('account')
                                }, {
                                    text: !is_nofee ? '话费剩余' : '话费超出',
                                    value: parseInt(!is_nofee ? feature.useble_balance : feature.this_month_owing) / 1000
                                }, {
                                    text: '点击详情立即续费',
                                    value: '-'
                                })

                        } else {
                            var is_nofee = feature.product_remain == 0;
                            var left;
                            var product_use = parseInt(feature.product_use);

                            product_use = feature.product_unit == 1 ? Math.round(product_use / 1024) + 'M' : (product_use / 100 + '元')

                            if (is_nofee) {
                                left = parseInt(feature.product_over);
                                left = feature.product_over_unit == 1 ? Math.round(left / 1024) + 'M' : (left / 100 + '元');

                            } else {
                                left = Math.round(feature.product_remain / 1024) + "M";
                            }

                            item.title = is_nofee ? '流量超出提醒' : '流量不足提醒';
                            details.push({
                                text: is_nofee ? '您的套餐内流量已用完' : '您的套餐内流量剩余已不多',
                                value: '-'
                            }, {
                                    text: '本月已用',
                                    value: product_use
                                }, {
                                    text: !is_nofee ? '本月剩余' : '本月超出',
                                    value: left
                                }, {
                                    text: '点击详情立即续费',
                                    value: '-'
                                })
                        }

                        console.log(feature);
                    });
                    break;

                //娱乐
                case '100022':
                    break;
                case '100026':
                    res.data.forEach(function(item) {
                        if (item.type == -1) {
                            return;
                        }
                        item.feature = JSON.parse(item.feature);
                    });
                    break;
            }

        });

        loader.setParam({
            business_id: business_id
        });
        self.bindScrollTo(model.refs.main);

        this.waitLoad().then(function() {
            businessModel.getNotifications().each(function(item) {
                if (item.get('business_id') == business_id) {
                    item.set({
                        unread: 0,
                        isRead: true
                    });
                }
            });

            return loader.request();

        }).catch(function(e) {
            Toast.showToast(e.message);
        });
    },

    onShow: function() {
        var self = this;
    },

    onDestroy: function() {
        this.model.destroy();
    }
});