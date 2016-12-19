
var $ = require('$'),
    util = require('util'),
    Activity = require('activity'),
    vm = require('core/model2'),
    bridge = require('bridge');

var userModel = require('../models/user');
var user = require('../logical/user');

var Loader = require('../widget/loader');
var Selector = require('../widget/selector');
var Calendar = require('../widget/calendar');
var guid = 0;

var Toast = require('widget/toast');


module.exports = Activity.extend({

    showCity: function () {
        var provId = this.model.data.user.ProvID;
        var index = util.indexOf(this.provinceList, function (item) {
            return item.PRV_ID == provId;
        });

        if (index != -1) {
            this.city.eq(0).index(index);
            this.changeCity(provId);
        }
        this.city.show();
    },

    changeCity: function (provID) {
        var self = this;

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
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new vm.Model(this.$el, {
            title: '个人信息',
            back: self.swipeRightBackAction
        });

        this.bindScrollTo(this.model.refs.main);

        var userInfo = userModel.get();

        var calendar = new Calendar();

        model.setBirthDay = function () {
            calendar.set(userInfo.BirthDay || "1990-01-01").show();

            calendar.onChange = function (date) {
                user.updateBirthDay(date).then(function () {

                    userModel.set({
                        BirthDay: Date.parse(date)
                    });
                    self.model.set('user.BirthDay', Date.parse(date));

                }).catch(function (err) {
                    Toast.showToast(err.message);
                });
            }
        }

        model.setChildBirthDay = function () {
            calendar.set(userInfo.ChildBirthDay || "1990-01-01").show();

            calendar.onChange = function (date) {
                user.updateChildBirthDay(date).then(function () {

                    userModel.set({
                        ChildBirthDay: Date.parse(date)
                    });
                    self.model.set('user.ChildBirthDay', Date.parse(date));

                }).catch(function (err) {
                    Toast.showToast(err.message);
                });
            }
        }

        var familys = [];
        for (var i = 1; i <= 10; i++) {
            familys.push({
                value: i,
                text: i + '人'
            });
        }

        var family = new Selector({
            options: [{
                template: '<li><%=text%></li>',
                data: familys
            }],

            complete: function (results) {
                var res = results[0];

                user.updateUser('familySize', res.value).then(function () {

                    userModel.set({
                        FamilySize: res.value
                    });
                    self.model.set('user.FamilySize', res.value);

                }).catch(function (err) {
                    Toast.showToast(err.message);
                });
            }
        });

        model.setFamily = function () {
            family.show();
        }

        var hasChildren = new Selector({
            options: [{
                template: '<li><%=text%></li>',
                data: [{
                    text: '有小孩',
                    value: 1
                }, {
                    text: '无小孩',
                    value: 0
                }]
            }],

            complete: function (results) {
                var res = results[0];

                user.updateUser('hasChild', res.value).then(function () {

                    userModel.set({
                        HasChild: res.value
                    });
                    self.model.set('user.HasChild', res.value);

                }).catch(function (err) {
                    Toast.showToast(err.message);
                });
            }
        });

        model.setChildren = function () {
            hasChildren.show().eq(0).val(userInfo.HasChild);
        }


        this.model.showCity = this.showCity.bind(this);

        this.city = new Selector({
            options: [{
                template: '<li><%=PRV_DESC%></li>',
                data: [],
                onChange: function (index, res) {
                    self.changeCity(res.PRV_ID)
                }
            }, {
                template: '<li><%=CTY_DESC%></li>',
                data: []
            }],

            complete: function (res) {
                var cityId = res[1].CTY_ID;

                self.model.set('user.CityName', res[1].CTY_DESC);
                self.model.set('user.CityID', res[1].CTY_ID);
                self.model.set('user.ProvID', res[1].CTY_PRV_ID);

                user.updateCity(cityId).then(function () {

                    userModel.set({
                        CityID: cityId,
                        CityName: res[1].CTY_DESC,
                        ProvID: res[1].CTY_PRV_ID
                    });

                }).catch(function (err) {
                    Toast.showToast(err.message);
                });
            }
        });



        new Loader({
            url: '/api/user/get_city',
            $el: this.$el,
            success: function (res) {
                res.province.unshift({
                    PRV_ID: 0,
                    PRV_DESC: '请选择'
                })
                self.city.eq(0).set(res.province);

                self.provinceList = res.province;
                self.cityList = res.data;

                self.changeCity(res.province[0].PRV_ID);
            }

        }).load();

    },

    onShow: function () {

        this.model.set({
            user: userModel.get()
        })
    },

    onDestroy: function () {
    }
});
