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

var Menu = require('../components/menu');

var publicquan = require('../logical/publicquan');
var quan = require('../logical/quan');
var messagesList = require('../models/messagesList');


module.exports = Activity.extend({

    loadPublicQuan: function () {

        var loader = this.loader;
        var model = this.model;
        var self = this;

        loader.showLoading();

        Promise.all([publicquan.recommend(), publicquan.myrecommend(), publicquan.myfollow()])
            .then(function (results) {
                var res = results[0];

                model.set({
                    recommendPublicQuan: res.data

                }).next(function () {

                    self.bindScrollTo(model.refs.recommend, {
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

    loadQuan: function ($scroll) {

        var self = this;
        var model = this.model;
        var quanLoader = self.quanLoader;

        switch (quanLoader) {
            case 1:
                break;

            case undefined:
                self.quanLoader = 1;
                quan.getAll().then(function (results) {
                    self.quanLoader = results[0];

                    self.quanLoader.autoLoadMore(function (res) {
                        model.get("quanData").add(res.data);
                    });

                    model.set({
                        quanData: results[1].data
                    })
                });
                break;

            default:
                quanLoader.reload().then(function (res) {
                    model.set({
                        quanData: res.data
                    })
                });
                break;
        }
    },

    loadContacts: function () {

    },

    menu: function () {

        var self = this;

        if (!this._menu) {
            this._menu = new Menu();
            this._menu.$el.prependTo(this.$el)[0].clientHeight;
        }

        requestAnimationFrame(function () {

            $(self.model.refs.home).addClass('menu_aexit');
            self._menu.$el.addClass('menu_enter');
        });

        Application.addBackAction(this.exitMenu);
    },

    exitMenu: function () {
        this._menu && this._menu.$el.removeClass('menu_enter');
        $(this.model.refs.home).removeClass('menu_aexit');
        Application.removeBackAction(this.exitMenu);
    },

    onCreate: function () {
        var self = this;

        this.exitMenu = this.exitMenu.bind(this);

        var loader = this.loader = new Loader(this.$el);

        var model = self.model = new Model(this.$el, {
            title: '',
            messagesList: messagesList
        });

        model.menu = this.menu.bind(this);
        model.exitMenu = function (e) {
            if ($(e.target).hasClass('hm_home'))
                self.exitMenu();
        }

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
        this.exitMenu();
    },

    onDestory: function () {
        this.model.destory();
    }
});
