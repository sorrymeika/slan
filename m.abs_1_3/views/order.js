var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/base');
var userModel = require('models/user');
var bridge = require('bridge');

module.exports = Activity.extend({
    events: {
        'tap .js_pay:not(.disabled)': function () {
            var self = this;
            var order = this.model.get('data');

            self.orderApi.showLoading();

            setTimeout(function () {
                self.orderApi.hideLoading();
            }, 3000);

            self.checkStatus();

            if (this.model.get('payType') == 1) {
                //bridge.openInApp(api.API.prototype.baseUri + '/AlipayDirect/Pay/' + order.PUR_ID + "?UserID=" + self.user.ID + "&Auth=" + self.user.Auth);

                bridge.ali({
                    type: 'pay',
                    spUrl: api.API.prototype.baseUri + '/AlipayApp/Pay',
                    orderCode: order.PUR_CODE

                }, function (res) {
                    sl.tip(res.msg);
                    self.orderApi.hideLoading();
                });

            } else {

                bridge.wx({
                    type: 'pay',
                    spUrl: api.API.prototype.baseUri + '/api/shop/wxcreateorder',
                    orderCode: order.PUR_CODE,
                    orderName: 'ABS商品',
                    orderPrice: order.PUR_AMOUNT
                }, function (res) {
                    sl.tip(res.msg);
                    self.orderApi.hideLoading();
                });
            }
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.user = userModel.get();

        self.swipeRightBackAction = self.route.query.from || self.route.referrer || '/';

        Scroll.bind($main);

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '订单详情',
            payType: 1
        });

        self.orderApi = new api.OrderAPI({
            $el: self.$el,
            params: {
                orderId: self.route.data.id,
                UserID: self.user.ID,
                Auth: self.user.Auth
            },
            success: function (res) {
                console.log(res);

                self.model.set({
                    data: res.data
                })

                if (res.data.PUR_PAS_ID == 2) {
                    self.forward("/news/order" + self.route.query.id);
                }
            }
        });

        self.orderApi.load();

        self.orderStatusAPI = new api.OrderStatusAPI({
            $el: this.$el,
            check: false,
            checkData: false,
            success: function (res) {
                if (res.status != 2) {
                    self.timer = setTimeout(function () {
                        self.checkStatus();
                    }, 2000);

                } else if (res.status == 2) {
                    self.forward("/news/order" + self.route.data.id);
                    self.model.set('data.PUR_PAS_ID', 2);
                }
            }
        });

        if (self.route.query.refresh) {
            self.checkStatus();
        }
    },

    checkStatus: function () {
        var self = this;

        self.timer && clearTimeout(self.timer);

        self.orderStatusAPI.setParam({
            id: self.route.data.id

        }).load();
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        self.timer && clearTimeout(self.timer);
    }
});
