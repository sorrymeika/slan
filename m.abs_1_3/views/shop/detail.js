var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loader');
var model = require('core/model');
var animation = require('animation');
var api = require('models/api');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    onCreate: function () {
        var self = this;

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeBack,
            title: '图文详情',
            id: self.route.params.id
        });

        this.bindScrollTo(self.$('.main'));

        var detail = new api.ProductDetailAPI({
            $el: self.$el,
            params: {
                id: self.route.params.id
            },
            success: function (res) {
                self.model.set({
                    data: res.data
                });
                console.log(res);
            }
        });
        detail.load();
    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
    }
});
