var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var Selector = require('widget/selector');
var business = require('logical/business');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var business_id = this.business_id = this.route.params.id;
        var isModify = this.route.query.modify && this.route.data.data;

        var model = this.model = new Model(this.$el, {
            title: isModify ? '修改缴费账户' : '新增缴费账户',
            business_id: business_id,
            isModify: isModify
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var unitnoSelector = new Selector({
            options: [{
                template: '<li><%=name%></li>',
                data: business_id == '100004' ? [{
                    name: '福州自来水有限公司',
                    value: '1020'
                }, {
                    name: '泉州自来水有限公司',
                    value: '3326'
                }, {
                    name: '石狮自来水有限公司',
                    value: '3329'
                }, {
                    name: '晋江自来水有限公司',
                    value: '3330'
                }] : business_id == '100005' ? [{
                    name: '福建省电力',
                    value: '1008'
                }] : [{
                    name: '龙岩数字广电',
                    value: '5058'
                }],
                onChange: function (i, data) {
                }
            }],
            complete: function (results) {
                console.log(results[0]);

                model.set('unit', results[0]);
            }
        });

        model.selectUnit = function () {
            unitnoSelector.show()
        }

        var ubid;

        if (isModify) {
            var data = this.route.data.data;

            ubid = data.ubid;

            unitnoSelector.eq(0).val('value', data.unitno);

            model.set({
                data: data,
                unit: unitnoSelector.data()[0],
                user_code: data.user_code
            });
            console.log(data, unitnoSelector.data());
        }

        model.save = function () {
            var unitno = this.get('unit.value');
            if (!unitno) {
                Toast.showToast('请选择缴费单位');
                return;
            }
            var user_code = this.get('user_code');
            if (!user_code) {
                Toast.showToast('请填写户号');
                return;
            }
            if (!isModify && !this.get('agree')) {
                Toast.showToast('请先同意《自助缴费服务协议》');
                return;
            }
            if (loader.isLoading) return;

            loader.showLoading();

            var promise = isModify ? business.updateBill(ubid, business_id, unitno, user_code, '我家') : business.addBill(business_id, unitno, user_code, '我家');

            promise.then(function (res) {
                Toast.showToast(isModify ? '修改成功' : '添加成功！');

                self.setResult('LIFE_BILL_CHANGE');

                model.back();

            }).catch(function (e) {
                Toast.showToast(e.message);

            }).then(function () {
                loader.hideLoading();
            });
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([this.waitLoad()]).then(function (results) {

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
