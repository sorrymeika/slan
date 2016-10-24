var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var bridge = require('bridge');

var publicquan = require('logical/publicquan');
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
            var title = this.data.title;

            if (!title) {
                Toast.showToast('请输入帖子标题');
                return;
            }

            var content = this.data.content;
            if (!content) {
                Toast.showToast('请输入帖子正文');
                return;
            }

            var quan = this.data.quan;

            if (!quan || quan.length === 0) {
                Toast.showToast('请添加圈子');
                return;
            }

            var quan_ids = [];

            quan.forEach(function (item) {
                quan_ids.push(item.quan_id);
            });

            var images = this.data.images;
            var postImages = null;

            var saveImages = [];

            if (images) {
                postImages = {};
                images.forEach(function (img, i) {
                    postImages["img" + i] = img.id;

                    saveImages.push(img.thumbnail);
                })
            }

            loader.showLoading();

            publicquan.publish({
                quan_ids: quan_ids,
                title: title,
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
