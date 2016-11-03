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
var user = require('../models/user');
var userLogical = require('../logical/user');
var auth = require('../logical/auth');


module.exports = Activity.extend({

    loadPublicQuan: function () {

        var loader = this.loader;
        var model = this.model;
        var self = this;

        loader.showLoading();

        //publicquan.recommend(),
        //publicquan.myrecommend(),
        Promise.all([publicquan.myfollow(), userLogical.getMe()])
            .then(function (results) {
                var res = results[0];

                model.set({
                    //recommendPublicQuan: res.data

                }).next(function () {
                    /*
                    self.bindScrollTo(model.refs.recommend, {
                        vScroll: false,
                        hScroll: true
                    });
                    */
                });

                res.data.forEach(function (item) {
                    if (item.imgs) {
                        item.imgs = item.imgs.split(',')
                    }
                });

                model.set({
                    // myrecommendPublicQuan: results[0].data,
                    myfollowPublicQuan: res.data
                });
            })
            .catch(function (e) {

                if (e.message == '无权限') {
                    self.forward('/login');
                } else
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
                        res.data.forEach(function (item) {
                            if (item.imgs) {
                                item.imgs = item.imgs.split(',')
                            }
                        });
                        model.get("quanData").add(res.data);
                    });

                    model.set({
                        quanData: results[1].data
                    })
                });
                break;

            default:
                quanLoader.reload().then(function (res) {
                    res.data.forEach(function (item) {
                        if (item.imgs) {
                            item.imgs = item.imgs.split(',')
                        }
                    });
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

    scan: function () {
        bridge.qrcode.scan(function (res) {
            alert(res.code);
        });
    },

    onCreate: function () {
        var self = this;

        this.exitMenu = this.exitMenu.bind(this);

        var loader = this.loader = new Loader(this.$el);

        var model = self.model = new Model(this.$el, {
            title: '',
            messagesList: messagesList,
            user: user
        });

        model.showQuanMenu = function () {
            $(this.refs.quanMenuMask).show();
            $(this.refs.quanMenu).show();
        }

        model.hideQuanMenu = function (url, e) {
            $(this.refs.quanMenuMask).hide();
            $(this.refs.quanMenu).hide();

            if (typeof url == 'string') {
                self.forward(url);
            }
        }
        model.scan = this.scan.bind(this);
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
                        quan.on('sendComment', function (e, data) {

                            var msg = model.getModel('quanData').find('msg_id', data.msg_id);

                            var comments = msg.getModel('comments');

                            data = $.extend(data, user.data);

                            if (comments) {
                                comments.add([data]);

                            } else {
                                comments.set([data]);
                            }
                        });

                        quan.on('publish', function (e, data) {
                            var quanData = model.getModel('quanData');

                            quanData.unshift(data);
                        });

                        model.commentQuanMsg = function (msg_id, user_id, user_name) {
                            self.forward('/quan/comment?msg_id=' + msg_id, user_name && user_id != user.data.user_id ? {
                                user_id: user_id,
                                user_name: user_name

                            } : undefined);
                        }

                        model.blackQuanMsg = function (msg_id) {
                            var quanData = model.getModel('quanData');

                            quan.black(msg_id).then(function () {
                                Toast.showToast('屏蔽成功');

                                quanData.remove('msg_id', msg_id);

                            }).catch(function (e) {
                                Toast.showToast(e.message);
                            });
                        }

                        model.likeQuanMsg = function (msg_id) {
                            var msg = model.getModel('quanData').find('msg_id', msg_id);
                            var likes = msg.getModel('likes');

                            if (likes && likes.find('user_id', user.data.user_id)) {
                                Toast.showToast('你已点赞！');
                                return;
                            }

                            quan.like(msg_id).then(function () {

                                var res = {
                                    user_id: user.data.user_id,
                                    user_name: user.data.user_name
                                }

                                if (!likes) {
                                    msg.set({
                                        likes: [res]
                                    })

                                } else {
                                    likes.add(res);
                                }

                                Toast.showToast('点赞成功');

                            }).catch(function (e) {
                                Toast.showToast(e.message);
                            });
                        }
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

    },

    onLoad: function () {

    },

    onShow: function () {
        var self = this;

        if (!auth.getAuthToken()) {
            self.forward('/login');
        } else {
            this.loadPublicQuan();
            this.loadQuan();
        }
    },

    onHide: function () {
        this.exitMenu();
    },

    onDestory: function () {
        this.model.destory();
    }
});
