var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var business = require('logical/business');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var waterData = [{
            business_id: 100004
        }];

        var elecData = [{
            business_id: 100005
        }];

        var model = this.model = new Model(this.$el, {
            title: '缴费账户',
            waterData: waterData,
            elecData: elecData
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.modify = function (item) {
            self.forward('/life/addbill/' + item.business_id + "?modify=true", {
                data: item
            });
            return false;
        }

        model.more = function () {
            popup.options({
                options: [{
                    text: '水费',
                    click: function () {
                        this.hide();

                        self.forward('/life/addbill/100004');
                    }
                }, {
                    text: '电费',
                    click: function () {
                        this.hide();

                        self.forward('/life/addbill/100005');
                    }
                }, {
                    text: '取消',
                    click: function () {
                        this.hide();
                    }
                }]
            })
        }

        model.delete = function (item) {
            popup.confirm({
                title: '温馨提醒',
                content: '确定要删除该帐号吗',
                confirmText: '确定删除',
                confirmAction: function () {
                    if (loader.isLoading) return;
                    loader.showLoading();

                    var cf = this;

                    business.deleteUserBusiness(item.ubid).then(function (res) {
                        loadBusiness();

                    }).catch(function (e) {
                        Toast.showToast(e.message);

                    }).then(function () {
                        loader.hideLoading();

                        cf.hide();
                    });
                },
                cancelText: '取消',
                cancelAction: function () {
                }
            });
            return false;
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        function loadBusiness() {
            waterData = [{
                business_id: 100004
            }];

            elecData = [{
                business_id: 100005
            }];

            Promise.all([business.getUserBusiness(0), self.waitLoad()]).then(function (results) {

                results[0].data.forEach(function (item) {
                    switch (item.business_id) {
                        case 100004:
                            if (!waterData[0].ubid) {
                                Object.assign(waterData[0], item);
                            } else {
                                waterData.push(item);
                            }
                            break;
                        case 100005:
                            if (!elecData[0].ubid) {
                                Object.assign(elecData[0], item);
                            } else {
                                elecData.push(item);
                            }
                            break;
                    }
                });

                model.set({
                    waterData: waterData,
                    elecData: elecData
                })

            }).catch(function (e) {
                Toast.showToast(e.message);

            }).then(function () {
                loader.hideLoading();
            });
        }

        loadBusiness();

        self.onResult('LIFE_BILL_CHANGE', loadBusiness);
        self.bindScrollTo(model.refs.main);
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
