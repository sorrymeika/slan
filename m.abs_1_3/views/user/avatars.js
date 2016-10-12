var $ = require('$');
var util = require('util');
var bridge = require('bridge');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;

var Toast = require('widget/toast');
var api = require('models/api');
var userModel = require('models/user');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        this.loader = new Loader({
            $el: this.$el
        })

        var model = this.model = new Model(this.$el, {
            title: '头像'
        });
        this.bindScrollTo(model.refs.main);

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        model.camera = function () {
            bridge.image.camera(function (res) {
                model.set({
                    src: res.src
                });
                self.uploadAvatars(res.id);
            });
        }

        model.photo = function () {
            bridge.image.photo(function (res) {
                model.set({
                    src: res.src
                });

                self.uploadAvatars(res.id);
            });
        }
    },

    uploadAvatars: function (imageId) {
        var loader = this.loader;

        if (loader.isLoading) return;

        var user = userModel.get();
        var self = this;

        loader.showLoading();

        bridge.image.upload(api.ShopAPI.url('/api/user/uploadGravatar'), {
            ID: user.ID,
            pspcode: user.Auth
        }, {
                absgravatar: imageId

            }, function (res) {
                Toast.showToast(res.msg);

                if (res.success) {
                    userModel.set({
                        Avatars: self.model.data.src
                    });
                }

                loader.hideLoading();
            });
    },

    onShow: function () {
        var self = this;
        var user = userModel.get();

        if (user) {
            this.model.set({
                src: user.Avatars
            })
        }
    },

    onDestory: function () {
    }
});
