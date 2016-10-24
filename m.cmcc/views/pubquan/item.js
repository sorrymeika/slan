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
                        is_follow: res.is_follow
                    })

                }).catch(function (e) {
                    Toast.showToast(e.message);
                })
            }

            if (model.get('quanInfo').is_follow)
                popup.confirm({
                    content: '确定不关注该圈了吗？',
                    confirmAction: function(){
                        follow()
                        this.hide();
                    }
                })
            else follow();
        }

        Promise.all([publicquan.item(quanId), publicquan.newArticles(quanId), this.waitLoad()]).then(function (results) {

            model.set({
                quanInfo: results[0].data,
                newArticles: results[1].data
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
