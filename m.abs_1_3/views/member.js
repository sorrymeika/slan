
var $ = require('$'),
    util = require('util'),
    Activity = require('activity'),
    model = require('core/model2'),
    bridge = require('bridge');

var userModel = require('../models/user');
var Loader = require('../widget/loader');
var Selector = require('../widget/selector');
var guid = 0;

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

        this.model = new model.Model(this.$el, {
            title: '个人信息',
            back: self.swipeRightBackAction
        });

        this.model.showCity = this.showCity.bind(this);

        this.bindScrollTo(this.model.refs.main);

        this.model.submit = function () {
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

        this.update = new Loader({
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
                onChange: function (index, res) {
                    self.changeCity(res.PRV_ID)
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

    onDestory: function () {
    }
});
