var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loader');
var model = require('core/model');
var animation = require('animation');
var api = require('models/api');
var userModel = require("models/user");

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    defBackUrl: '/',

    onCreate: function () {
        var self = this;

        self.swipeRightBackAction = self.query.from || self.referrer || self.defBackUrl;

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '去拼团吧'
        });

        this.bindScrollTo(self.model.refs.main);

        self.groupListAPI = new api.GroupListAPI({
            $el: self.$el,

            success: function (res) {

                self.model.set({
                    data: res.data
                })
            }
        });

        self.groupListAPI.load();
    },

    onShow: function () {
        var self = this;

        self.user = userModel.get();

        self.model.set({
            isLogin: !!self.user
        })
    },

    onDestroy: function () {
    }
});
