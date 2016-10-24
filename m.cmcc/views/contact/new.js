var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var contact = require('logical/contact');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '新的朋友'
        });

        model.acceptFriend = function (personId, e) {
            contact.acceptFriend(personId).then(function () {
                contact.trigger('acceptFriend', personId);

                var person = model.getModel('newFriends').find("user_id", personId);

                person.set({
                    status: 1
                });

            }).catch(function (e) {
                Toast.showToast(e.message);
            });

            return false;
        }

        model.del = function (personId, e) {

            var person = model.getModel('newFriends').remove("user_id", personId);


            return false;
        }

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([contact.newFriends(), this.waitLoad()]).then(function (results) {

            model.set({
                newFriends: results[0].data
            })

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

    onDestory: function () {
        this.model.destroy();
    }
});
