define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model2');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var api = require('models/base');
    var bridge = require('bridge');
    var userModel = require("models/user");

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function () {
                this.orderCreateApi.load();
            },
            'tap .js_address': function () {
                this.forward('/address?buy=1&from=' + encodeURIComponent(this.route.url));
            }
        },

        onCreate: function () {
            var self = this;
            var $main = self.$('.main');

            self.swipeRightBackAction = self.route.query.from || '/cart';
            self.user = userModel.get();

            Scroll.bind($main);

            self.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: '确认订单',
                payType: 1,
                couponprice: 0
            });

            $.extend(self.model, {
                getPrice: function (bag_amount, coupon, Points) {
                    var couponPrice = coupon && coupon.VCA_DEDUCT_AMOUNT ? coupon.VCA_DEDUCT_AMOUNT : 0;
                    if (coupon && coupon.VCT_ID == 5) {
                        couponPrice = 0;
                    }
                    return Math.max(0, bag_amount - couponPrice - (Points / 100));
                },

                getFreight: function (bag_amount, coupon, Points, freecouponcode) {

                    console.log(bag_amount, coupon, Points, freecouponcode);

                    var price = this.getPrice(bag_amount, coupon, Points);
                    var freight = ((self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || price >= 99 || freecouponcode) ? 0 : 15);

                    return (self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || price >= 99) ? "免邮费" : ('¥' + Math.round(freight * 100) / 100);
                },

                getTotal: function (bag_amount, coupon, Points, freecouponcode) {
                    var couponPrice = coupon && coupon.VCA_DEDUCT_AMOUNT ? coupon.VCA_DEDUCT_AMOUNT : 0;
                    var total;
                    var price;
                    var freight;

                    if (coupon && coupon.VCT_ID == 5) {
                        price = Math.max(0, bag_amount - couponPrice - (Points / 100));
                        freight = ((self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || bag_amount - (Points / 100) >= 99 || freecouponcode) ? 0 : 15);
                        total = Math.max(0, bag_amount + freight - couponPrice - (Points / 100));

                    } else {
                        price = Math.max(0, bag_amount - couponPrice - (Points / 100));
                        total = price + ((self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || price >= 99 || freecouponcode) ? 0 : 15);
                    }

                    return '¥' + (Math.round(total * 100) / 100);
                }
            });

            var address = new api.AddressListAPI({
                $el: this.$el,
                params: {
                    pspcode: self.user.PSP_CODE
                },
                checkData: false,
                success: function (res) {
                    if (res.data && res.data[0]) {
                        self.model.set({
                            address: util.first(res.data, function (item) {
                                return item.MBA_DEFAULT_FLAG
                            }) || res.data[0]
                        });
                    }
                }
            });
            address.load();

            self.cart = new api.CartAPI({
                $el: self.$el,
                checkData: false,
                success: function (res) {
                    console.log(res);
                    self.model.set(res).set({
                        loading: false
                    });
                }
            });

            self.cart.setParam({
                pspcode: self.user.PSP_CODE
            });

            self.orderCreateApi = new api.OrderCreateAPI({
                $el: this.$el,
                beforeSend: function () {
                    var address = self.model.get('address');
                    if (!address) {
                        sl.tip('请填写收货地址信息');
                        return false;
                    }

                    this.setParam({
                        mba_id: address.AddressID,
                        pay_type: self.model.get('payType')
                    });
                },
                checkData: false,
                success: function (res) {
                    if (res.success) {
                        sl.tip("生成订单成功！");

                        self.setResult('OrderChange')
                            .setResult('ResetCart')
                            .setResult('UserChange');

                        if (res.pur_amount != 0) {

                            if (self.model.get('payType') == 1) {
                                bridge.ali({
                                    type: 'pay',
                                    spUrl: api.API.prototype.baseUri + '/AlipayApp/Pay',
                                    orderCode: res.code

                                }, function (res) {
                                    sl.tip(res.msg);
                                });

                            } else {

                                bridge.wx({
                                    type: 'pay',
                                    spUrl: api.API.prototype.baseUri + '/api/shop/wxcreateorder',
                                    orderCode: res.code,
                                    orderName: 'ABS商品',
                                    orderPrice: res.pur_amount

                                }, function (res) {
                                    sl.tip(res.msg);
                                });
                            }
                        }

                        self.forward('/order/' + res.pur_id + "?from=/myorder&refresh=1");
                    }
                },
                error: function (res) {
                    sl.tip(res.msg);
                }
            });

            self.onResult('useAddress', function (e, address) {
                self.model.set({
                    address: address
                });
            });
        },

        onShow: function () {
            var self = this;
            self.user = userModel.get();

            self.orderCreateApi.setParam({
                pspcode: self.user.PSP_CODE,
                pay_type: 1,
                coupon: this.model.getState('selectedCoupon.CSV_CODE') || '',
                points: self.route.query.points,
                freecoupon: this.model.getState('selectedFreeCoupon.CSV_CODE') || ''
            });

            self.model.set({
                Points: self.route.query.points ? parseInt(self.route.query.points) : 0
            });

            self.cart.load();
        },

        onDestory: function () {
        }
    });
});
