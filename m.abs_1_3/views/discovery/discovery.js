var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loader');
var model = require('core/model');
var animation = require('animation');
var api = require("models/api");
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

        this.bindScrollTo(self.$('.main'));

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

        self.swipeBack = self.route.query.from || self.route.referrer || '/';

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeBack,
            url: encodeURIComponent(self.route.url)
        });

        this.bindScrollTo(self.model.refs.productScroll, {
            hScroll: true
        });


        var discoveryAddShareAPI = new api.DiscoveryAddShareAPI({
            $el: self.$el,
            params: {
                dcvid: self.route.params.id
            }
        });

        var discoveryFavAPI = new api.DiscoveryFavAPI({
            $el: self.$el,
            params: {
                dcvid: self.route.params.id
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
                dcvid: self.route.params.id
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
                id: self.route.params.id,
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

    onDestroy: function () {
    }
});
