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
            'tap,click .main a': function (e) {
                var self = this;
                var m = e.currentTarget.href.match(/\#(.+)$/);
                if (m) {
                    var top = self.$('[name="' + m[1] + '"]').offset().top;
                    this.$('.main')[0].scrollTop = top;
                }
                return false;
            }
        },

        onCreate: function () {
            var self = this;
            var $main = this.$('.main');

            this.swipeBack = this.route.from || this.route.referrer || '/steward';

            self.user = util.store('user');

            this.bindScrollTo($main);

            this.model = new model.ViewModel(this.$el, {
                back: this.swipeBack,
                title: '爱管家',
                id: this.route.params.id
            });

            var detailAPI = new api.StewardDetailAPI({
                $el: self.$el,
                checkData: false,
                params: $.extend({
                    pspcode: self.user.PSP_CODE,
                    detail_id: self.model.get('id')

                }, self.user.token),

                success: function (res) {
                    console.log(res);

                    self.model.set(res);
                }
            });
            detailAPI.load();
        },

        onShow: function () {
            var self = this;
        },

        onDestroy: function () {
        }
    });
});
