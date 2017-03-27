define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loader');
    var model = require('core/model');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var api = require('models/api');

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function () {
                var self = this;

            }
        },
        swipeBack: '/steward',

        onCreate: function () {
            var self = this;

            var $main = this.$('.main');

            this.bindScrollTo($main);
            
            self.user = util.store('user');

            this.model = new model.ViewModel(this.$el, {
                back: '/steward',
                title: '爱管家',
                id: self.route.params.id,
                url: self.route.url
            });

            var stewardAPI = new api.StewardAPI({
                $el: self.$el,
                params: $.extend({
                    prh_id: self.model.get('id')

                }, self.user.token),

                success: function (res) {
                    console.log(res);

                    self.model.set(res);
                }
            });
            stewardAPI.load();
        },

        onShow: function () {
            var self = this;
        },

        onDestroy: function () {
        }
    });
});
