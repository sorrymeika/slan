var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var hdh = require('logical/hdh');
var hdhModel = require('models/hdh');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var subphone = this.subphone = this.route.params.subphone;
        var list = hdhModel.getSubPhoneList(list);
        var info = hdhModel.getSubInfo(subphone);

        console.log(this.route)

        var model = this.model = new Model(this.$el, {
            title: '副号配置',
            info: info,
            defAlias: '副号' + (1 + list.indexOf(info))
        });

        model.delegate = this;

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([hdh.subinfo(subphone), this.waitLoad()]).then(function (results) {

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    setPower: function (isOff) {
        var loader = this.loader;
        loader.showLoading();

        hdh.setPower(this.subphone, isOff).then(function () {

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    interceptSms: function (isOff) {
        var loader = this.loader;
        loader.showLoading();

        hdh.interceptSms(this.subphone, isOff).then(function () {

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });

    },

    interceptCall: function (isOff) {
        var loader = this.loader;
        loader.showLoading();

        hdh.interceptCall(this.subphone, isOff).then(function () {

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    setDefaultCall: function () {
    },

    setMemo: function () {
        this.forward('/hdh/memo/' + this.subphone + "?alias=" + (this.model.get('info.alias') || this.model.get('defAlias')));
    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
        this.model.destroy();
    }
});