define(function(require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loader');
    var model = require('core/model2');
    var animation = require('animation');
    var api = require('models/api');
    var bridge = require('bridge');
    var userModel = require("models/user");

    return Activity.extend({

        onCreate: function() {
            var self = this;
            var $main = self.$('.main');

            self.user = userModel.get();

            this.bindScrollTo($main);

            self.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: '确认订单',
                payType: 1,
                couponprice: 0
            });

            $.extend(self.model, {

                selectAddress: function() {
                    self.forward('/address?buy=1&from=' + encodeURIComponent(self.route.url));
                },

                useCoupon: function(isFree) {
                    if (isFree && this.refs.freight.innerHTML == '免邮费') return;
                    self.forward('/shop/useCoupon?from=' + encodeURIComponent(self.route.url), {
                        coupon: this.data.coupon,
                        isFree: isFree,
                        selected: isFree ? this.data.selectedFreeCoupon : this.data.selectedCoupon,
                        bag_amount: this.data.bag_amount
                    });
                },

                usePoint: function() {
                    self.forward('/shop/usePoint?from=' + encodeURIComponent(self.route.url), {
                        points: this.data.Points
                    });
                },

                useInv: function() {
                    self.forward('/shop/useInv?from=' + encodeURIComponent(self.route.url), {
                        requireInv: this.data.requireInv,
                        company: this.data.company,
                        isCompany: this.data.isCompany
                    });
                },

                getPrice: function(bag_amount, coupon, Points) {
                    var couponPrice = coupon && coupon.VCA_DEDUCT_AMOUNT ? coupon.VCA_DEDUCT_AMOUNT : 0;
                    if (coupon && coupon.VCA_VCT_ID == 5) {
                        couponPrice = 0;
                    }
                    return Math.max(0, bag_amount - couponPrice - (Points / 100));
                },

                getFreight: function(bag_amount, full_amount_free, coupon, Points, freecouponcode) {

                    console.log(bag_amount, full_amount_free, coupon, Points, freecouponcode);

                    var price = this.getPrice(bag_amount, coupon, Points);
                    var freight = ((self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || price >= full_amount_free || freecouponcode) ? 0 : 15);

                    return (self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || price >= full_amount_free) ? "免邮费" : ('¥' + Math.round(freight * 100) / 100);
                },

                getTotal: function(bag_amount, full_amount_free, coupon, Points, freecouponcode) {
                    var couponPrice = coupon && coupon.VCA_DEDUCT_AMOUNT ? coupon.VCA_DEDUCT_AMOUNT : 0;
                    var total;
                    var price;
                    var freight;

                    if (coupon && coupon.VCA_VCT_ID == 5) {
                        price = Math.max(0, bag_amount - couponPrice - (Points / 100));
                        freight = ((self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || bag_amount - (Points / 100) >= full_amount_free || freecouponcode) ? 0 : 15);
                        total = Math.max(0, bag_amount + freight - couponPrice - (Points / 100));

                    } else {
                        price = Math.max(0, bag_amount - couponPrice - (Points / 100));
                        total = price + ((self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || price >= full_amount_free || freecouponcode) ? 0 : 15);
                    }

                    return '¥' + (Math.round(total * 100) / 100);
                },

                createOrder: function() {
                    self.orderCreateApi.load();
                }
            });

            var address = new api.AddressListAPI({
                $el: this.$el,
                params: {
                    pspcode: self.user.PSP_CODE
                },
                checkData: false,
                success: function(res) {
                    if (res.data && res.data[0]) {
                        self.model.set({
                            address: util.first(res.data, function(item) {
                                return item.MBA_DEFAULT_FLAG
                            }) || res.data[0]
                        });
                    }
                }
            });
            address.load();

            var cartPromise = new api.CartAPI({
                $el: self.$el,
                checkData: false,
                params: {
                    pspcode: self.user.PSP_CODE
                }
            }).request().then(function(res) {
                self.model.set({
                    bag_amount: res.bag_amount,
                    full_amount_free: parseInt(res.full_amount_free),
                    coupon: util.find(res.coupon, function(item) {
                        return item.VCT_ID != 4;
                    }),
                    freight: res.freight
                });

                return res;
            });

            self.cart = new api.PreOrderAPI({
                $el: self.$el,
                checkData: false,
                params: {
                    pspcode: self.user.PSP_CODE
                },
                success: function(res) {
                    var data = res.data;

                    cartPromise.then(function(cartInfo) {
                        var packageList = cartInfo.data_package;

                        data.forEach(function(item) {
                            var resultPackageList = [];
                            var tagPackageList = item.packagelist;
                            if (tagPackageList) {

                                console.log(packageList)

                                packageList.forEach(function(ppg) {
                                    var flag = false;

                                    //判断套餐是否属于该仓库
                                    ppg.PackageList.forEach(function(prd) {

                                        var index = util.indexOf(tagPackageList, function(tagPrd) {
                                            return tagPrd.SPB_ID == prd.SPB_ID;
                                        });

                                        if (index != -1) {
                                            flag = true;
                                        }
                                    });

                                    if (flag)
                                        resultPackageList.push(ppg);
                                });

                                console.log(resultPackageList);

                                item.packagelist = resultPackageList;
                            }
                        });

                        self.model.set({
                            data: data,
                            loading: false
                        });
                    });


                }
            });

            self.orderCreateApi = new api.OrderCreateAPI({
                $el: this.$el,
                beforeSend: function() {
                    var address = self.model.get('address');
                    if (!address) {
                        sl.tip('请填写收货地址信息');
                        return false;
                    }

                    var requireInv = self.model.get('requireInv') ? true : false;
                    var isCompany = self.model.get('isCompany');

                    if (requireInv && isCompany && !self.model.get('company')) {
                        Toast.showToast('请填写公司抬头');
                        return false;
                    }

                    this.setParam({
                        mba_id: address.AddressID,
                        pay_type: self.model.get('payType'),
                        inv_flag: requireInv,
                        inv_title: requireInv ? isCompany ? self.model.get('company') : '个人' : ''
                    });
                },
                checkData: false,
                success: function(res) {
                    if (res.success) {
                        sl.tip("生成订单成功！");

                        self.setResult('OrderChange')
                            .setResult('CartChange')
                            .setResult('UserChange');

                        if (res.pur_amount != 0) {

                            switch (self.model.get('payType')) {
                                case 1:
                                    bridge.ali({
                                        type: 'pay',
                                        spUrl: api.API.prototype.baseUri + '/AlipayApp/Pay',
                                        orderCode: res.code

                                    }, function(res) {
                                        sl.tip(res.msg);
                                    });
                                    break;
                                case 2:
                                    bridge.wx({
                                        type: 'pay',
                                        spUrl: api.API.prototype.baseUri + '/api/shop/wxcreateorder',
                                        orderCode: res.code,
                                        orderName: 'ABS商品',
                                        orderPrice: res.pur_amount

                                    }, function(res) {
                                        sl.tip(res.msg);
                                    });
                                    break;
                                case 3:
                                    bridge.cmbpay(api.API.prototype.baseUri + "/api/cmbpay/pay?orderCode=" + res.code);
                                    break;
                            }
                            self.forward('/order/' + res.pur_id + "?from=/myorder&refresh=1");

                        } else {
                            self.forward("/news/order" + res.pur_id);
                        }

                    }
                },
                error: function(res) {
                    sl.tip(res.msg);
                }
            });

            self.onResult('useAddress', function(e, address) {
                self.model.set({
                    address: address
                });
            });
        },

        onShow: function() {
            var self = this;
            var routeData = self.route.data;

            console.log(routeData);

            self.user = userModel.get();

            self.model.set({
                selectedCoupon: routeData.coupon,
                selectedFreeCoupon: routeData.freeCoupon,
                Points: routeData.points ? parseInt(routeData.points) : 0,
                requireInv: routeData.requireInv,
                company: routeData.company,
                isCompany: routeData.isCompany
            });

            self.orderCreateApi.setParam({
                pspcode: self.user.PSP_CODE,
                pay_type: 1,
                coupon: self.model.get('selectedCoupon.CSV_CODE') || '',
                points: routeData.points,
                freecoupon: self.model.get('selectedFreeCoupon.CSV_CODE') || ''
            });

            self.cart.load();
        },

        onDestroy: function() {}
    });
});