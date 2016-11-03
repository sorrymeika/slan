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

    toggleAnim: 'up',

    onCreate: function () {
        var self = this;

        var routeData = this.route.data;



        var model = this.model = new Model(this.$el, {
            title: '评论'
        });

        if (routeData.user_id) {
            model.set({
                user_id: routeData.user_id,
                user_name: routeData.user_name,
                comment: '@' + routeData.user_name + ' '
            })
        }

        model.sendComment = function () {
            var content = this.data.comment;
            if (!content) {
                Toast.showToast('请填写评论内容');
                return;
            }

            publicquan.sendComment(self.route.query.msg_id, content).then(function (res) {
                Toast.showToast('发送成功');
                model.back();

            }).catch(function (e) {
                Toast.showToast(e.message);
            });
        }

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }
    },

    onShow: function () {
        this.model.refs.comment.focus();
    },

    onDestory: function () {
        this.model.destroy();
    }
});
