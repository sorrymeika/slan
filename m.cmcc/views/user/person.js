var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');
var user = require('models/user');

var imagePicker = require('components/imagePicker');
var userLogical = require('logical/user');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '个人资料',
            user: user
        });

        console.log(model.data.user)
        console.log(user);
        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        model.changeAvatars = function () {
            imagePicker.show('更换头像', function (res) {

                userLogical.setAvatars(res.id);

                user.set({
                    avatars: res.thumbnail
                });
            });
        }

        Promise.all([this.waitLoad()]).then(function (results) {

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
