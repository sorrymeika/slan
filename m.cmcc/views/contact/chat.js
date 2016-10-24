var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var chat = require('logical/chat');
var user = require('models/user');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var personId = this.route.params.id;

        var model = this.model = new Model(this.$el, {});

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.send = function () {
            if (!this.data.content) return;

            chat.send({
                type: chat.MESSAGETYPE.TEXT,
                content: this.data.content,
                user_id: personId
            });
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([chat.getMessages(personId), this.waitLoad()]).then(function (results) {

            var data = results[0];

            model.set({
                user: user,
                friend: data.user,
                messages: data.data
            });

            self.scroll = self.bindScrollTo(model.refs.main).eq(0);

            console.log(self.scroll);

            self.scroll.scrollToEnd();

            model.scrollToEnd = function () {
                self.scroll.scrollToEnd();
            }

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
