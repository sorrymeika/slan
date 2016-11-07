var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');
var user = require('models/user');
var userLogical = require('logical/user');
var district = require('logical/district');

var Selector = require('widget/selector');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var type = this.route.params.type;

        var model = this.model = new Model(this.$el, {
            user: user,
            type: type
        });

        switch (type) {
            case 'user_name':
                model.set('user_name', user.get('user_name'));
                break;
            case 'sign_text':
                model.set({
                    title: '个人签名',
                    sign_text: user.get('sign_text')
                });
                break;
            case 'gender':
                model.set({
                    title: '性别',
                    gender: user.get('gender')
                });
                break;
            case 'hometown':
                model.set({
                    title: '故乡',
                    country_name: user.get('home_country_name'),
                    province_name: user.get('home_province_name'),
                    city_name: user.get('home_city_name')
                });

                var selector = self.selector = new Selector({
                    options: [{
                        template: '<li><%=country_name%></li>',
                        onChange: function (i, data) {
                            district.getProvinces(data.country_id).then(function (res) {
                                selector.eq(1).set(res.data);
                                if (user.get('province_id')) {
                                    sel.val('province_id', user.get('province_id'));
                                }
                            });
                        }
                    }, {
                        template: '<li><%=province_name%></li>',
                        onChange: function (i, data) {
                            district.getCities(data.province_id).then(function (res) {
                                var sel = selector.eq(2).set(res.data);
                                if (user.get('city_id')) {
                                    sel.val('city_id', user.get('city_id'));
                                }
                            });
                        }
                    }, {
                        template: '<li><%=city_name%></li>',
                        onChange: function (i, data) {
                        }
                    }],
                    complete: function (res) {

                        model.set({
                            country_id: res[0].country_id,
                            country_name: res[0].country_name,
                            province_id: res[1].province_id,
                            province_name: res[1].province_name,
                            city_id: res[2].city_id,
                            city_name: res[2].city_name
                        })
                    }
                });

                district.getCountries().then(function (res) {
                    var countrySel = selector.eq(0).set(res.data);

                    if (user.get('country_id')) {
                        countrySel.val('country_id', user.get('country_id'));
                    }
                });

                model.selectCity = function () {
                    selector.show();
                }
                break;

            case 'address':
                model.set({
                    title: '所在地',
                    country_name: user.get('country_name'),
                    province_name: user.get('province_name'),
                    city_name: user.get('city_name')
                });

                var selector = self.selector = new Selector({
                    options: [{
                        template: '<li><%=country_name%></li>',
                        onChange: function (i, data) {
                            district.getProvinces(data.country_id).then(function (res) {
                                selector.eq(1).set(res.data);
                                if (user.get('province_id')) {
                                    sel.val('province_id', user.get('province_id'));
                                }
                            });
                        }
                    }, {
                        template: '<li><%=province_name%></li>',
                        onChange: function (i, data) {
                            district.getCities(data.province_id).then(function (res) {
                                var sel = selector.eq(2).set(res.data);
                                if (user.get('city_id')) {
                                    sel.val('city_id', user.get('city_id'));
                                }
                            });
                        }
                    }, {
                        template: '<li><%=city_name%></li>',
                        onChange: function (i, data) {
                        }
                    }],
                    complete: function (res) {

                        model.set({
                            country_id: res[0].country_id,
                            country_name: res[0].country_name,
                            province_id: res[1].province_id,
                            province_name: res[1].province_name,
                            city_id: res[2].city_id,
                            city_name: res[2].city_name
                        })
                    }
                });

                district.getCountries().then(function (res) {
                    var countrySel = selector.eq(0).set(res.data);

                    if (user.get('country_id')) {
                        countrySel.val('country_id', user.get('country_id'));
                    }
                });

                model.selectCity = function () {
                    selector.show();
                }
                break;
        }

        console.log(user.data);

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        model.save = function () {
            var result;
            switch (type) {
                case 'user_name':
                    result = userLogical.set("user_name", this.get('user_name'));
                    break;
                case 'sign_text':
                    result = userLogical.set("sign_text", this.get('sign_text'));
                    break;
                case 'gender':
                    result = userLogical.set("gender", this.get('gender'));
                    break;
                case 'hometown':
                    result = userLogical.set("home_city_id", this.get('city_id')).then(function () {
                        user.set({
                            home_city_name: model.get('city_name'),
                            home_province_id: model.get('province_id'),
                            home_province_name: model.get('province_name'),
                            home_country_id: model.get('country_id'),
                            home_country_name: model.get('country_name')
                        });

                    });
                    break;
                case 'address':
                    result = userLogical.set("city_id", this.get('city_id')).then(function () {
                        user.set({
                            city_name: model.get('city_name'),
                            province_id: model.get('province_id'),
                            province_name: model.get('province_name'),
                            country_id: model.get('country_id'),
                            country_name: model.get('country_name')
                        });
                    });
                    break;
            }

            result.then(function () {
                model.back();
            }).catch(function (e) {
                Toast.showToast(e.message);
            })

        }

        Promise.all([this.waitLoad()]).then(function (results) {

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
