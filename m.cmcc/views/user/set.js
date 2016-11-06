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

var Selector = require('widget/selector');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var type = this.route.params.type;

        var model = this.model = new Model(this.$el, {
            user: user,
            type: type
        });

        var provinceList = [{
            province_id: 1,
            province_name: '福建'
        }, {
            province_id: 10,
            province_name: '上海'
        }];

        var cityList = [{
            province_id: 1,
            city_id: 1,
            city_name: '福州'
        }, {
            province_id: 1,
            city_id: 2,
            city_name: '厦门'
        }, {
            province_id: 1,
            city_id: 1,
            city_name: '三江'
        }, {
            province_id: 10,
            city_id: 4,
            city_name: '黄埔'
        }, {
            province_id: 10,
            city_id: 3,
            city_name: '徐汇'
        }];

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
                    country_name: '中国',
                    province_name: '福建',
                    city_name: '福州'
                });

                var selector = self.selector = new Selector({
                    options: [{
                        template: '<li><%=province_name%></li>',
                        onChange: function (i, data) {

                            selector.eq(1).set(util.find(cityList, function (city) {
                                return city.province_id == data.province_id;
                            }))
                        }
                    }, {
                        template: '<li><%=city_name%></li>',
                        onChange: function (i, data) {
                        }
                    }],
                    complete: function (res) {

                        model.set({
                            province_id: res[0].province_id,
                            province_name: res[0].province_name,
                            city_id: res[1].city_id,
                            city_name: res[1].city_name
                        })
                    }
                });
                selector.eq(0).set(provinceList);
                selector.eq(1).set(util.find(cityList, function (city) {
                    return city.province_id == provinceList[0].province_id;
                }));

                model.selectCity = function () {
                    selector.show();
                }
                break;

            case 'address':
                model.set({
                    title: '所在地',
                    country_name: '中国',
                    province_name: '福建',
                    city_name: '福州'
                });


                var selector = self.selector = new Selector({
                    options: [{
                        template: '<li><%=province_name%></li>',
                        onChange: function (i, data) {

                            selector.eq(1).set(util.find(cityList, function (city) {
                                return city.province_id == data.province_id;
                            }))
                        }
                    }, {
                        template: '<li><%=city_name%></li>',
                        onChange: function (i, data) {
                        }
                    }],
                    complete: function (res) {

                        model.set({
                            province_id: res[0].province_id,
                            province_name: res[0].province_name,
                            city_id: res[1].city_id,
                            city_name: res[1].city_name
                        })
                    }
                });
                selector.eq(0).set(provinceList);
                selector.eq(1).set(util.find(cityList, function (city) {
                    return city.province_id == provinceList[0].province_id;
                }));

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
                    result = userLogical.set("home_city_id", this.get('city_id'));
                    break;
                case 'address':
                    result = userLogical.set("city_id", this.get('city_id'));
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
