var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require("models/base");
var discoveryModel = require("models/discovery");
var Share = require('components/share');
var userModel = require('models/user');

module.exports = Activity.extend({
    events: {
        'tap .js_share': function () {
            this.share.show();
        }
    },

    onCreate: function () {
        var self = this;

        Scroll.bind(self.$('.main'));

        self.user = userModel.get();

        self.share = new Share({
            head: '分享'
        });
        self.share.callback = function (res) {
            discoveryAddShareAPI.setParam({
                pspcode: self.user.PSP_CODE
            }).load();
        }
        self.share.$el.appendTo(self.$el);

        self.swipeRightBackAction = self.route.query.from || self.route.referrer || '/';

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            url: encodeURIComponent(self.route.url)
        });

        Scroll.bind(self.model.refs.productScroll, {
            hScroll: true
        });


        var discoveryAddShareAPI = new api.DiscoveryAddShareAPI({
            $el: self.$el,
            params: {
                dcvid: self.route.data.id
            }
        });

        var discoveryFavAPI = new api.DiscoveryFavAPI({
            $el: self.$el,
            params: {
                dcvid: self.route.data.id
            },
            success: function () {
                self.model.set('data.Like_Flag', true).set("data.DCV_LIKE_QTY", (self.model.data.data.DCV_LIKE_QTY || 0) + 1);
            },

            error: function (res) {
                sl.tip(res.msg)
            }
        });

        var discoveryRemoveFavAPI = new api.DiscoveryRemoveFavAPI({
            $el: self.$el,
            params: {
                dcvid: self.route.data.id
            },
            success: function () {
                self.model.set('data.Like_Flag', false).set("data.DCV_LIKE_QTY", (self.model.data.data.DCV_LIKE_QTY || 1) - 1);
            },

            error: function (res) {
                sl.tip(res.msg)
            }
        });

        var discoveryAPI = new api.DiscoveryAPI({
            $el: self.$el,
            params: {
                id: self.route.data.id,
                pspcode: self.user.PSP_CODE
            },
            checkData: false,
            success: function (res) {

                self.model.set({
                    data: res.data,
                    plist: !res.plist || res.plist.length !== undefined ? res.plist : [res.plist]
                });

                self.share.set({
                    title: res.data ? res.data.DCV_TITLE : '',
                    linkURL: res.data ? res.data.Share_Url : '',
                    description: ''
                });
            },

            error: function () {

            }
        });

        self.model.fav = function () {
            if (!this.data.data.Like_Flag) {

                discoveryFavAPI.setParam({
                    pspcode: self.user.PSP_CODE
                }).load();

            } else {
                discoveryRemoveFavAPI.setParam({
                    pspcode: self.user.PSP_CODE
                }).load();
            }
        }

        discoveryAPI.load();
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
