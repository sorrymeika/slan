var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loader');
var model = require('core/model');
var animation = require('animation');
var api = require("models/api");
var userModel = require('models/user');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    onCreate: function () {
        var self = this;

        this.bindScrollTo(self.$('.main'));

        self.user = userModel.get();

        self.swipeRightBackAction = self.route.query.from || self.route.referrer || '/';

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: self.route.query.name || '会生活'
        });

        self.model.sortBy = function (e, sort) {
            self.discoverListAPI.setParam({
                orderby: sort == "POST" ? 'desc' : 'asc',
                order: sort

            }).reload();

            $(e.currentTarget).addClass('curr').siblings('.curr').removeClass('curr')
        }

        self.discoverListAPI = new api.DiscoverListAPI({
            $el: self.$el,

            success: function (res) {
                console.log(res);

                self.model.set({
                    data: res.data
                });
            },

            error: function () {
            }
        });
    },

    onLoad: function () {
        var self = this;

        self.discoverListAPI.setParam({
            dctid: this.route.params.id || 0,
            wd: this.route.query.s || '',
            pspcode: self.user.PSP_CODE,
            orderby: 'asc',
            order: 'VIEW'

        }).load();
    },

    onDestory: function () {
    }
});
