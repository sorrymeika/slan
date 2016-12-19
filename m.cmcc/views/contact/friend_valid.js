var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var contact = require('logical/contact');
var user = require('models/user');

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;
        var personId = this.route.params.friend_id;

        var model = this.model = new Model(this.$el, {
            title: '朋友验证',
            msg: '我是' + user.get('user_name')
        });

        model.back = function() {
            self.back(self.swipeRightBackAction);
        }

        model.addFriend = function() {

            contact.addFriend(personId).then(function() {
                Toast.showToast('发送成功');

                contact.trigger('addFriend');

                model.back();

            }).catch(function(e) {
                Toast.showToast(e.message);
            });
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([this.waitLoad()]).then(function(results) {


            self.bindScrollTo(model.refs.main);

        }).catch(function(e) {
            Toast.showToast(e.message);

        }).then(function() {
            loader.hideLoading();
        });
    },

    onShow: function() {
        var self = this;
    },

    onDestroy: function() {
        this.model.destroy();
    }
});