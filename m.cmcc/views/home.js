var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loader = require('../widget/loader');
var Model = require('core/model2').Model;
var Scroll = require('../widget/scroll');
var Slider = require('../widget/slider');
var Tab = require('../widget/tab');
var Toast = require('../widget/toast');
var animation = require('animation');
var Promise = require('promise');

var publicquan = require('../logical/publicquan');
var quan = require('../logical/quan');

util.cnNum = function (num) {
    if (num > 10000) {
        num = (num + '');
        return num.substr(0, num.length - 4) + "万";
    } else if (num > 1000) {

        num = (num + '');
        return num.substr(0, num.length - 4) + 'k';
    } else {
        return num;
    }
}

module.exports = Activity.extend({

    loadPublicQuan: function () {

        var loader = this.loader;
        var model = this.model;

        loader.showLoading();

        Promise.all([publicquan.recommend(), publicquan.myrecommend(), publicquan.myfollow()])
            .then(function (results) {
                var res = results[0];

                model.set({
                    recommendPublicQuan: res.data

                }).next(function () {

                    Scroll.bind(model.refs.recommend, {
                        vScroll: false,
                        hScroll: true
                    });
                });

                model.set({
                    myrecommendPublicQuan: results[1].data,
                    myfollowPublicQuan: results[2].data
                });
            })
            .catch(function (e) {
                Toast.showToast(e.message);
            })
            .then(function () {
                loader.hideLoading();
            });
    },

    loadQuan: function ($container) {

        if (!this.quanLoader) {
            var self = this;

            this.quanLoader = new quan.Loader({
                $el: $container,

                pageEnabled: false,

                success: function (res) {
                    self.model.set("quanData", res.data);
                },

                append: function (res) {
                    self.model.get("quanData").add(res.data);
                },

                error: function (e) {


                    if (sl.isDebug) {
                        this.success({
                            success: true,
                            data: [{
                                user_id: 1,
                                user_name: '小光',
                                avatars: 'images/logo.png',
                                content: '阿斯顿发发',
                                date: 1476101924277,
                                imgs: ['images/logo.png', 'images/logo.png'],
                                comments: [{
                                    user_id: 2,
                                    user_name: '小智',
                                    content: '想休息休息',
                                    at_user_id: 0,
                                    at_user_name: 'xxx'
                                }]
                            }, {
                                    user_id: 3,
                                    user_name: '小黑',
                                    avatars: 'images/logo.png',
                                    content: '阿斯顿叔叔说发发',
                                    date: 1476101924277,
                                    imgs: ['images/logo.png', 'images/logo.png'],
                                    comments: [{
                                        user_id: 4,
                                        user_name: '小煤',
                                        content: '想休ss息休息',
                                        at_user_id: 2,
                                        at_user_name: '小智'
                                    }]
                                }]
                        });
                    }
                }
            });
        }

        this.quanLoader.request();
    },

    loadContacts: function () {

    },

    onCreate: function () {
        var self = this;

        var loader = this.loader = new Loader(this.$el);

        var model = self.model = new Model(this.$el, {
            title: ''
        });

        model.next(function () {
            var tab = self.tab = this.refs.tab;
            var records = {};
            records[0] = true;

            model.set({
                quanTab: tab
            });

            tab.on('tabChange', function (e, index) {

                if (records[index]) return;
                records[index] = true;

                switch (index) {

                    case 1:
                        self.loadQuan(this.refs.items[index]);
                        break;

                    case 2:
                        self.loadContacts();
                        break;
                }
            });
        });

        model.changeTab = function (tab) {
            this.set({
                tab: tab
            });
        }

        this.loadPublicQuan();
    },

    onLoad: function () {

    },

    onShow: function () {
        var self = this;
    },

    onHide: function () {
    },

    onDestory: function () {
        this.model.destory();
    }
});
