var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var api = require('models/base');
var Share = require('components/share');
var userModel = require('models/user');
var bridge = require('bridge');

module.exports = Activity.extend({
    events: {
        'tap .js_share_activity': function () {

            var self = this;

            bridge.wx({
                type: 'shareLinkURL',
                linkURL: this.model.data.data.SCA_SHARE_URL,
                tagName: 'abs',
                title: this.model.data.data.SCA_SHARE_TITLE,
                description: this.model.data.data.SCA_SHARE_DESC,
                image: this.model.data.data.SCA_SHARE_PIC,
                scene: 1
            }, function (res) {

                if (res.success) {
                    self.addActivityCouponAPI.setParam({
                        pspcode: self.user.PSP_CODE,
                        vca_id: self.model.data.data.SCA_VCA_ID
                    }).load();

                } else {
                    sl.tip('您已取消分享');
                }
            })

        }
    },

    defBackUrl: '/',

    onCreate: function () {
        var self = this;

        self.swipeRightBackAction = self.route.query.from || self.route.referrer || self.defBackUrl;

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: 'ABS家居'
        });

        Scroll.bind(self.model.refs.main);

        self.user = userModel.get();

        var appShareActivityAPI = new api.AppShareActivityAPI({
            $el: self.$el,
            params: {
                id: self.route.data.id
            },
            success: function (res) {
                self.model.set({
                    data: res.data
                });
            }
        });

        appShareActivityAPI.load();

        self.addActivityCouponAPI = new api.AddActivityCouponAPI({
            $el: self.$el,
            params: {
                id: 20
            },
            success: function (res) {
                if (res.success) {
                    self.confirm(res.msg, function () {
                    });
                }
            },
            error: function () {
            }
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
