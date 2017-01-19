var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var contact = require('logical/contact');
var friends = require('models/friends');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '新的朋友'
        });

        friends.set({ newFriendsCount: 0 });

        model.acceptFriend = function (personId, e) {
            contact.acceptFriend(personId).then(function () {
                contact.trigger('acceptFriend', personId);

                model._('newFriends').updateBy("user_id", personId, {
                    status: 1
                });

                self.forward('/contact/memo/' + personId)

            }).catch(function (e) {
                Toast.showToast(e.message);
            });

            return false;
        }

        model.getUserShowName = friends.getUserShowName;

        model.del = function (fid, e) {
            model.getModel('newFriends').remove("fid", fid);

            contact.hideItem(fid);

            return false;
        }

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        contact.on('addFriend', function () {
            contact.newFriends().then(function (res) {
                model.set({
                    newFriends: res.data
                });
            });
        });

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        friends.set({
            newFriendsCount: 0
        });

        Promise.all([contact.newFriends(), this.waitLoad()]).then(function (results) {
            var data = results[0].data;

            friends.getFriends().update(util.map(data, ['user_id', 'user_name']), 'user_id');

            model.set({
                newFriends: data
            });

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });

    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
        this.model.destroy();
    }
});