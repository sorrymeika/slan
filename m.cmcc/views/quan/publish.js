var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var bridge = require('bridge');

var quan = require('logical/quan');
var imagePicker = require('components/imagePicker');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            images: []
        });

        model.back = function () {
            self.back();
        }

        model.selectImage = function () {

            imagePicker.show(function (res) {
                model.getModel('images').add(res);
            });
        }

        var loader = this.loader = new Loader(this.$el);

        model.addQuan = function () {
            self.forward("/pubquan/select", {
                list: this.get('quan')
            })
        }

        model.submit = function () {

            var content = this.data.content;
            var images = this.data.images;

            if (!content && (!images || !images.length)) {
                return;
            }
            var postImages = null;
            var saveImages = [];

            if (images) {
                postImages = [];
                images.forEach(function (img, i) {
                    postImages.push({
                        name: 'images',
                        value: img.id
                    });
                    saveImages.push(img.thumbnail);

                })
            }

            loader.showLoading();

            quan.publish({
                content: content,
                images: postImages,
                saveImages: saveImages

            }).then(function (results) {
                Toast.showToast('发布成功！');

                self.back();

            }).catch(function (e) {
                Toast.showToast(e.message);

            }).then(function () {
                loader.hideLoading();
            });
        }

        self.bindScrollTo(model.refs.main);
    },

    onAppear: function () {
        var self = this;

        var routeData = this.route.data;

        this.model.set({
            quan: routeData.list
        })
    },

    onDestory: function () {
        this.model.destroy();
    }
});
