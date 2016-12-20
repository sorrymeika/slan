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

        self.share.show();

        return false;
    },

    loadData: function () {
        var self = this;

        user.getCoupon(this.route.params.id, function (res) {

            var products = [];
            var data = res.data;

            if (res.data.Products) {
                res.data.Products.forEach(function (prd) {

                    if (util.indexOf(products, function (a) {
                        return a.PRD_NAME == prd.PRD_NAME;
                    }) == -1) {

                        products.push(prd);
                    }
                });
                res.data.Products = products;
            }

            self.model.set({
                data: res.data
            });

            user.getCouponStatus(res.data.CSV_ID, function (res) {

                if (res.overdue) {
                    return;
                }
                self.model.set({
                    canShare: true
                });

                self.share.set({
                    linkURL: res.url,
                    title: '两情相悦就送券！',
                    description: data.VCA_NAME
                });

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

    onDestroy: function () { }
});