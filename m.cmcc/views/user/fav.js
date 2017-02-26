var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');
var PhotoViewer = require('widget/photoViewer');

var userLogical = require('logical/user');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '我的收藏'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        model.del = function (id) {
            userLogical.delFav(id).then(function () {
                model._("data").remove("fav_id", id);
            }).catch(function (e) {
                Toast.showToast(e.message);
            });
        }

        var photoViewer = this.photoViewer = new PhotoViewer();

        photoViewer.$el.hide().appendTo('body')
            .addClass('g_beforeshow')
            .on($.fx.transitionEnd, function () {
                if (!photoViewer.$el.hasClass('g_show')) {
                    photoViewer.$el.hide();
                }
            })
            .on('tap', function () {
                photoViewer.$el.removeClass('g_show');
            });

        model.showImages = function (imgs, index) {

            photoViewer.setImages(imgs.map(function (src) {
                return {
                    src: sl.resource(src)
                }
            }));
            photoViewer.index(index);

            photoViewer.$el.show()[0].clientHeight;
            photoViewer.$el.addClass('g_show');
        }

        Loader.showLoading();

        Promise.all([userLogical.getFav(), this.waitLoad()]).then(function (results) {
            var data = results[0].data;

            data.forEach(function (item) {

                if (item.pub_quan_msg) {
                    var imgs;

                    if (item.pub_quan_msg.imgs) {
                        imgs = item.pub_quan_msg.imgs.split(',')
                    }

                    if ((!imgs || !imgs.length) && /<img\s+/.test(item.pub_quan_msg.content)) {
                        imgs = [];

                        item.pub_quan_msg.content.replace(/<img\s[^>]*?src=\"([^\"\>]+)\"/g, function (m, src) {
                            imgs.push(src);
                        });
                    }

                    if (imgs && imgs.length > 3) {
                        imgs.length = 3;
                    }
                    item.pub_quan_msg.imgs = imgs;

                } else if (item.quan_msgs) {
                    if (item.quan_msgs.imgs) {
                        item.quan_msgs.imgs = item.quan_msgs.imgs.split(',');
                    }
                }
            });

            model.set({
                data: data
            })

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            Loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
        this.photoViewer.$el.remove();
        this.photoViewer.destroy();
        this.model.destroy();
    }
});
