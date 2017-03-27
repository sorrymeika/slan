var $ = require('$');
var util = require('util');
var bridge = require('bridge');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;

var Toast = require('widget/toast');
var api = require('models/api');
var userModel = require('models/user');

var user = require('logical/user');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var userInfo = userModel.get();

        this.loader = new Loader({
            $el: this.$el
        });

        var model = this.model = new Model(this.$el, {
            title: '修改性别',
            gender: userInfo.Gender
        });

        model.back = function () {
            self.back(self.swipeBack);
        }

        model.save = function (gender) {

            user.updateGender(gender).then(function (res) {
                if (gender == userInfo.Gender) return;

                userModel.set({
                    Gender: gender
                });

                Toast.showToast('修改成功');

                self.back();

            }).catch(function (err) {
                Toast.showToast(err.message);
            })
        }
    },

    onShow: function () {
        var self = this;

    },

    onDestroy: function () {
    }
});
