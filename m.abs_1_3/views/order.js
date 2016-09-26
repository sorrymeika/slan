var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loader');
var model = require('core/model');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/api');
var userModel = require('models/user');
var bridge = require('bridge');

module.exports = Activity.extend({
    events: {
        'tap .js_pay:not(.disabled)': function() {
            var self = this;
            var order = this.model.get('data');

            self.orderApi.showLoading();

            setTimeout(function() {
                self.orderApi.hideLoading();
            }, 3000);

            self.checkStatus();

            switch (this.model.get('payType')) {

                case 1:
                    //bridge.openInApp(api.API.prototype.baseUri + '/AlipayDirect/Pay/' + order.PUR_ID + "?UserID=" + self.user.ID + "&Auth=" + self.user.Auth);

                    bridge.ali({
                        type: 'pay',
                        spUrl: api.API.prototype.baseUri + '/AlipayApp/Pay',
                        orderCode: order.PUR_CODE

                    }, function(res) {
                        sl.tip(res.msg);
                        self.orderApi.hideLoading();
                    });

                    break;
                case 2:
                    bridge.wx({
                        type: 'pay',
                        spUrl: api.API.prototype.baseUri + '/api/shop/wxcreateorder',
                        orderCode: order.PUR_CODE,
                        orderName: 'ABS商品',
                        orderPrice: order.PUR_AMOUNT
                    }, function(res) {
                        sl.tip(res.msg);
                        self.orderApi.hideLoading();
                    });
                    break;
                case 3:
                    bridge.cmbpay(api.API.prototype.baseUri + "/api/cmbpay/pay?orderCode=" + order.PUR_CODE);
                    break;
            }
        }
    },

    onCreate: function() {
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

        self.model.cancelOrder = function(e, order) {

            self.confirm('你确定取消订单吗？', function() {
                self.cancelOrderApi.setParam({
                    purcode: order.PUR_CODE

                }).load();
            });
            e.stopPropagation();
            e.preventDefault();
        };

        console.log(self.referrer)

        self.orderApi = new api.OrderAPI({
            $el: self.$el,
            params: {
                orderId: self.route.data.id,
                UserID: self.user.ID,
                Auth: self.user.Auth
            },
            success: function(res) {
                console.log(res);

                self.model.set({
                    data: res.data
                })

                if (self.referrer != '/myorder' && res.data.PUR_PAS_ID == 2) {
                    self.forward("/news/order" + self.route.data.id);
                }
            }
        });

        self.orderApi.load();

        self.orderStatusAPI = new api.OrderStatusAPI({
            $el: this.$el,
            check: false,
            checkData: false,
            success: function(res) {
                if (res.status != 2) {
                    self.timer = setTimeout(function() {
                        self.checkStatus();
                    }, 2000);

                } else if (res.status == 2) {
                    self.forward("/news/order" + self.route.data.id);
                    self.model.set('data.PUR_PAS_ID', 2);
                }
            }
        });

        self.cancelOrderApi = new api.CancelOrderAPI({
            $el: this.$el,
            checkData: false,
            params: {
                pspcode: self.user.PSP_CODE
            },
            success: function(res) {
                if (res.success) {
                    sl.tip('订单已成功取消');
                    self.orderApi.reload();

                    //通知更新优惠券数量
                    self.setResult("UserChange");
                }
            },
            error: function(res) {
                sl.tip(res.msg);
            }
        });

        if (self.route.query.refresh) {
            self.checkStatus();
        }
    },

    checkStatus: function() {
        var self = this;

        self.timer && clearTimeout(self.timer);

        self.orderStatusAPI.setParam({
            id: self.route.data.id

        }).load();
    },

    onShow: function() {
        var self = this;
    },

    onDestory: function() {
        self.timer && clearTimeout(self.timer);
    }
});