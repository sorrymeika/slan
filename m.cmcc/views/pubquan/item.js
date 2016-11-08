var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var publicquan = require('logical/publicquan');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var quanId = this.route.params.id;

        var model = this.model = new Model(this.$el, {
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.follow = function () {

            var follow = function () {
                publicquan.follow(quanId).then(function (res) {

                    console.log(res);

                    model.getModel('quanInfo').set({
                        is_follow: !model.get('quanInfo.is_follow')
                    })

                }).catch(function (e) {
                    Toast.showToast(e.message);
                })
            }

            if (model.get('quanInfo').is_follow)
                popup.confirm({
                    content: '确定不关注该圈了吗？',
                    confirmAction: function () {
                        follow()
                        this.hide();
                    }
                })
            else follow();
        }

        Promise.all([publicquan.item(quanId), publicquan.newArticles(quanId), this.waitLoad()]).then(function (results) {
            var quanInfo = results[0].data;
            if (quanInfo.summary) {
                quanInfo.summary = quanInfo.summary.replace(/<(\/{0,1}[a-zA-Z]+)(?:\s+[a-zA-Z1-9_-]+="[^"]*"|\s+[^\s]+)*?\s*(\/){0,1}\s*>/mg, '');
            }
            quanInfo.is_follow = quanInfo.pub_quan_follow ? quanInfo.pub_quan_follow.is_follow : false;

            var articles = results[1].data;

            articles.forEach(function (item) {

                if (item.imgs) {
                    item.imgs = item.imgs.split(',')
                }
            });

            model.set({
                quanInfo: quanInfo,
                newArticles: articles,
                newLength: Math.min(20, results[1].total)
            })

            self.mainScroll = self.bindScrollTo(model.refs.main);

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
