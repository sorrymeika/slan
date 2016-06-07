var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var Selector = require('widget/selector');
var animation = require('animation');
var api = require('models/base');

module.exports = Activity.extend({
    events: {
        'tap .js_submit:not(.disabled)': function () {
            this.editAddressAPI.load();
        },
        'tap .js_area': function () {
            var self = this;
            this.selector.show();
            if (self.model.data.province) {
                self.selector.eq(0).index(util.indexOf(self.provinceData, function (item) {
                    return item.PRV_ID == self.model.data.province.PRV_ID;
                }));
                self.resetCity();
            }
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.user = util.store('user');

        self.swipeRightBackAction = self.route.query.from || '/address';

        Scroll.bind($main);

        var id = self.route.query.id;
        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: id ? '设置地址' : '添加地址',
            address: {
                mbaDefault: true,
                mbaMobile: self.user.Mobile
            },
            user: self.user
        });

        if (id) {
            var address = util.store('address');
            address && self.model.set({
                address: {
                    mbaMobile: address.MBA_MOBILE,
                    mbaName: address.MBA_NAME,
                    mbaAddress: address.MBA_ADDRESS,
                    mbaDefault: address.MBA_DEFAULT_FLAG
                },
                province: {
                    PRV_ID: address.ProvinceID,
                    PRV_ABBR: address.Province
                },
                city: {
                    CTY_ID: address.MBA_CTY_ID,
                    CTY_ABBR: address.City
                },
                region: {
                    REG_ID: address.MBA_REG_ID,
                    REG_DESC: address.Area
                }
            });
        }

        self.selector = new Selector({
            options: [{
                template: '<li><%=PRV_ABBR%></li>',
                onChange: function (e, i, data) {
                    self.city.setParam({
                        prvId: data.PRV_ID || 0
                    }).load();
                }
            }, {
                    template: '<li><%=CTY_ABBR%></li>',
                    onChange: function (e, i, data) {
                        self.region.setParam({
                            ctyId: data.CTY_ID || 0
                        }).load();
                    }
                }, {
                    template: '<li><%=REG_DESC%></li>'
                }],
            complete: function (res) {

                self.model.set({
                    province: res[0],
                    city: res[1],
                    region: res[2]
                })
            }
        });

        self.selector.eq(0).set([{
            PRV_ABBR: '省'
        }]);

        self.selector.eq(1).set([{
            CTY_ABBR: '市'
        }]);

        self.selector.eq(2).set([{
            REG_DESC: '区'
        }]);

        this.province = new api.ProvinceAPI({
            $el: self.selector.$el,
            success: function (res) {
                self.provinceData = res.data;
                res.data.unshift({
                    PRV_ABBR: '省'
                });
                self.selector.eq(0).set(res.data);
            }
        });
        this.city = new api.CityAPI({
            $el: self.selector.$el,
            checkData: false,
            success: function (res) {
                self.cityData = res.data;

                res.data.unshift({
                    CTY_ABBR: '市'
                });
                self.selector.eq(1).set(self.cityData);
                self.resetCity();
            }
        });
        this.region = new api.RegionAPI({
            $el: self.selector.$el,
            checkData: false,
            success: function (res) {
                self.regionData = res.data;
                self.regionData.unshift({
                    REG_DESC: '区'
                });
                self.selector.eq(2).set(self.regionData);
                self.resetRegion();
            }
        });
        this.province.load();

        self.editAddressAPI = new api.EditAddressAPI({
            $el: self.$el,
            check: false,
            checkData: false,
            params: {
                pspcode: self.user.PSP_CODE
            },
            beforeSend: function () {
                var address = self.model.get('address');
                if (!address.mbaName) {
                    sl.tip('请填写收货人姓名');
                    return false;
                }
                if (!address.mbaMobile) {
                    sl.tip('请填写手机号码');
                    return false;
                } else if (!util.validateMobile(address.mbaMobile)) {
                    sl.tip('请填写正确的手机号码');
                    return false;
                }
                if (!address.mbaAddress) {
                    sl.tip('请填写详细地址');
                    return false;
                }
                var region = self.model.get('region');
                if (!region || !region.REG_ID) {
                    sl.tip('请选择省市区');
                    return false;
                }
                address.mbaRegId = region.REG_ID;
                address.mbaCtyId = self.model.get('city.CTY_ID');
                address.edittype = self.route.query.edittype || 1;
                address.mbaId = self.route.query.id || 0;

                this.setParam(address);
            },
            success: function (res) {
                if (res.success) {
                    sl.tip('设置成功！');

                } else if (res.msg) {
                    sl.tip(res.msg);
                    return;
                }

                if (self.route.query.buy) {
                    var addr = self.model.get('address');
                    self.setResult('useAddress', {
                        AddressID: addr.mbaId || res.data,
                        MBA_CTY_ID: addr.mbaCtyId,
                        MBA_REG_ID: addr.mbaRegId,
                        MBA_NAME: addr.mbaName,
                        MBA_FULL_ADDRESS: addr.mbaAddress,
                        MBA_MOBILE: addr.mbaMobile
                    });
                }

                self.back(self.route.query.buy ? decodeURIComponent(self.route.query.from.match(/from=([^&]+?)(&|$)/)[1]) : self.swipeRightBackAction);
            }
        });
    },

    resetCity: function () {
        var self = this;
        if (self.model.data.city) {
            var index = util.indexOf(this.selector.eq(1).data, function (item) {
                return item.CTY_ID == self.model.data.city.CTY_ID;
            });

            if (index != -1) {
                this.selector.eq(1).index(index);
            }
            self.resetRegion();
        }
    },

    resetRegion: function () {
        var self = this;
        if (self.model.data.region) {
            var index = util.indexOf(this.selector.eq(2).data, function (item) {
                return item.REG_ID == self.model.data.region.REG_ID;
            });

            if (index != -1)
                this.selector.eq(2).index(index);
        }
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
