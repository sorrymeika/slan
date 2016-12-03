var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var contact = require('logical/contact');
var friends = require('models/friends').getFriends();

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;
        var friend_id = this.route.params.id;
        var loader = this.loader = new Loader(this.$el);

        var friend = friends.find('user_id', friend_id);

        console.log(friend);

        var memo = friend.get('friends_ext.memo');

        var model = this.model = new Model(this.$el, {
            title: '备注',
            text: memo,
            origin: memo
        });

        model.save = function() {
            loader.showLoading();

            var memo = this.get('text');

            contact.setFriendMemo(friend_id, memo).then(function() {
                Toast.showToast("修改成功！");
                model.back();

            }).catch(function(e) {
                Toast.showToast(e.message);

            }).then(function() {
                loader.hideLoading();
            });
        }

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }
    },

    onShow: function() {
        var self = this;
    },

    onDestory: function() {
        this.model.destroy();
    }
});