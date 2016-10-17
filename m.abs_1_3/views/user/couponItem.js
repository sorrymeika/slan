var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Model = require('core/model2').Model;

var Toast = require('widget/toast');

var api = require('models/api');

var Share = require('components/share');
var userModel = require('models/user');

var user = require('logical/user');

module.exports = Activity.extend({

    shareCoupon: function (item, e) {
        var self = this;
        if (this.isLoading) return;
        this.isLoading = true;

        user.getCouponStatus(item.CSV_ID, function (res) {
            self.isLoading = false;

            if (res.overdue) {
                return;
            }
            self.share.set({
                linkURL: res.url,
                title: '两情相悦就送券！',
                description: item.VCA_NAME

            }).show();

        }).catch(function (err) {

            Toast.showToast(err.msg);
        });

        return false;
    },

    loadData: function () {
        var self = this;

        user.getCoupon(this.route.params.id, function (res) {

            self.model.set({
                data: res.data
            });

        }, this.$el);
    },

    onCreate: function () {
        var self = this;

        self.user = userModel.get();

        var model = new Model(this.$el, {
            back: this.swipeRightBackAction,
            title: '我的卡券'
        });

        this.model = model;

        this.bindScrollTo(model.refs.main);

        model.goTo = function (item) {
            if (item.LVP_PRD_ID) {
                self.forward("/item/" + item.LVP_PRD_ID + "?from=" + encodeURIComponent(self.route.url));
                return false;
            }
        }

        model.use = function (prods) {
            if (prods && prods[0].LVP_PRD_ID) {
                self.forward("/item/" + prods[0].LVP_PRD_ID + "?from=" + encodeURIComponent(self.route.url));
            } else {
                self.back("/?tab=0");
            }
            return false;
        }

        model.share = this.shareCoupon.bind(this);

        self.share = new Share({
            head: '分享这张优惠券'
        });
        self.share.callback = function (res) {
            if (!res.success) {
                sl.tip(res.msg);
            } else {
                sl.tip('分享成功');
                self.share.hide();
            }
        }

        self.share.$el.appendTo(self.$el);

        self.loadData();
    },

    onShow: function () {
        if (!userModel.get()) {
            this.forward('/login?success=' + this.route.url + "&from=/");
        }
    },

    onDestory: function () {
    }
});
