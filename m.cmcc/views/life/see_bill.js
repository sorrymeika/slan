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
        var ubid = this.id = this.route.params.id;
        var business_id = this.business_id = this.route.query.bid;

        var model = this.model = new Model(this.$el, {
            title: '生活缴费',
            ubid: ubid,
            business_id: business_id
        });

        var units = business_id == '100004' ? [{
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
        }];

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([business.queryBusiness(ubid), this.waitLoad()]).then(function (results) {
            var res = results[0];
            model.set({
                account: res.account,
                data: res.data,
                unit: util.first(units, 'value', res.account.unitno).name
            });

            if (!res.result) {
                Toast.showToast(res.message);
            }

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
