var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var hdh = require('logical/hdh');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '和多号'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.add = function () {
            model.hideMenu();
            self.forward('/hdh/index');
        }

        model.setSubphone = function (subphone) {
            model.hideMenu();
            self.forward('/hdh/subphone/' + subphone);
        }

        model.showMenu = function () {
            $(this.refs.menuMask).show();
            $(this.refs.menu).show();
        }

        model.hideMenu = function (url, e) {
            $(this.refs.menuMask).hide();
            $(this.refs.menu).hide();
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([hdh.getInfo(), this.waitLoad()]).then(function (results) {
            var data = results[0].data;
            var subPhoneList = data ? data.subphonelist : null;

            if (!subPhoneList || !subPhoneList.length) {
                self.forward('/hdh/index');
            }

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            if (e.retCode == 8401) {
                self.forward('/hdh/index');

            } else {
                Toast.showToast(e.message);
            }

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