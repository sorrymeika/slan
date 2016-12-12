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

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([business.queryBusiness(ubid), this.waitLoad()]).then(function (results) {

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
