var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/api');

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

        Scroll.bind(self.model.refs.main);

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
    },

    onDestory: function () {
    }
});
