define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        Activity = require('activity'),
        model = require('core/model'),
        Scroll = require('../widget/scroll'),
        bridge = require('bridge');
    var Loading = require('../widget/loading');
    var Selector = require('../widget/selector');
    var guid = 0;

    return Activity.extend({
        events: {
            'tap .radio': function (e) {
                var $target = $(e.currentTarget);
                var value = e.currentTarget.getAttribute('value');

                this.model.set($target.attr('sn-model'), value);
            }
        },

        onCreate: function () {
            var self = this;

            self.swipeRightBackAction = this.route.query.from || '/settings';

            this.model = new model.ViewModel(this.$el, {
                title: '个人信息',
                back: self.swipeRightBackAction,
                showCity: function () {
                    var index = util.indexOf(self.provinceList, function (item) {
                        return item.PRV_ID == self.model.data.user.ProvID;
                    });

                    if (index != -1) {
                        self.city.eq(0).index(index);
                        changeCity(self.model.data.user.ProvID);
                    }
                    self.city.show();
                },
                submit: function () {
                    this.set('submiting', true);
                    var user = this.data.user;
                    self.update.setParam({
                        ID: user.ID,
                        Auth: user.Auth,
                        UserName: user.UserName,
                        Gender: user.Gender,
                        BirthDay: user.BirthDay && util.formatDate(user.BirthDay),
                        ChildBirthDay: user.ChildBirthDay && util.formatDate(user.ChildBirthDay),
                        CityID: user.CityID,
                        FamilySize: user.FamilySize,
                        HasChild: user.HasChild

                    }).load();
                }
            });

            this.update = new Loading({
                url: '/api/user/update',
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if (res.success) {
                        util.store('user', self.model.data.user);
                        sl.tip('修改成功');

                    } else {
                        sl.tip(res.msg);
                    }
                    self.model.set('submiting', false);
                }
            });

            this.city = new Selector({
                options: [{
                    template: '<li><%=PRV_DESC%></li>',
                    data: [],
                    onChange: function (e, index, res) {
                        changeCity(res.PRV_ID)
                    }
                }, {
                    template: '<li><%=CTY_DESC%></li>',
                    data: []
                }],
                complete: function (res) {
                    self.model.set('user.City', res[1].CTY_DESC);
                    self.model.set('user.CityID', res[1].CTY_ID);
                    self.model.set('user.ProvID', res[1].CTY_PRV_ID);
                }
            });

            var changeCity = function (provID) {
                var city = util.find(self.cityList, function (item) {
                    return item.CTY_PRV_ID == provID;
                });

                city.unshift({
                    CTY_PRV_ID: provID,
                    CTY_ID: 0,
                    CTY_DESC: '请选择'
                });

                self.city.eq(1).set(city);
                if (self.model.data.user) {
                    var index = util.indexOf(city, function (item) {
                        return item.CTY_ID == self.model.data.user.CityID;
                    });

                    if (index != -1) {
                        self.city.eq(1).index(index);
                    }
                }
            }

            $.get(bridge.url('/api/user/get_city'), function (res) {
                res.province.unshift({
                    PRV_ID: 0,
                    PRV_DESC: '请选择'
                })
                self.city.eq(0).set(res.province);

                self.provinceList = res.province;
                self.cityList = res.data;

                changeCity(res.province[0].PRV_ID);

            }, 'json');
        },

        onShow: function () {
            var self = this;
            var user = util.store('user');
            if (user) {
                self.user = user;

                this.loading = new Loading({
                    url: '/api/user/get',
                    check: false,
                    checkData: false,
                    params: {
                        UserID: user.ID,
                        Auth: user.Auth
                    },
                    $el: this.$el,
                    success: function (res) {
                        self.user = user = $.extend(user, res.data);
                        util.store('user', user);
                        self.model.set({
                            user: user,
                            'NickName.input': user.NickName,
                            'Address.input': user.Address
                        });
                    }
                });
                this.loading.load();

            } else {
                this.forward('/login');
            }
        },

        onDestory: function () {
        }
    });
});
