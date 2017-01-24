var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');
var bridge = require('bridge');

var hdh = require('logical/hdh');
var hdhModel = require('models/hdh');
var user = require('models/user');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var subPhoneList = hdhModel.getSubPhoneList();

        var model = this.model = new Model(this.$el, {
            title: '和多号',
            subPhoneList: subPhoneList,
            number: '',
            isShowKeybord: true
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

        model.number = function (num) {
            this.set({
                number: this.get('number') + num
            })
        }

        model.call = function () {
            console.log(subPhoneList.get())

            var subPhones = [];
            var number = this.get('number');
            var confirm;

            subPhoneList.each(function (item, i) {
                console.log(item);

                item = item.data;

                subPhones.push({
                    text: '副号' + item.order + ":" + item.subphone + (item.state.charAt(0) == 1 ? "(关机)" : ''),
                    click: function () {
                        if (item.state.charAt(0) == 1)
                            Toast.showToast('该副号已关机');
                        else {
                            bridge.system.phoneCall("12583" + item.order + number);
                            confirm.hide();
                        }
                    }
                })
            })

            confirm = popup.options({
                options: [{
                    text: '主号:' + user.get('account'),
                    click: function () {
                        bridge.system.phoneCall(number);
                        confirm.hide();
                    }

                }].concat(subPhones)
            })
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

    onDestroy: function () {
        this.model.destroy();
    }
});