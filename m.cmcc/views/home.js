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
var popup = require('../widget/popup');
var PhotoViewer = require('widget/photoViewer');
var animation = require('animation');
var Promise = require('promise');

var Menu = require('../components/menu');
var yunMiRules = require('../components/yunMiRules');
var publicquan = require('../logical/publicquan');
var quan = require('../logical/quan');
var messagesList = require('../models/messagesList');
var user = require('../models/user');
var userLogical = require('../logical/user');
var auth = require('../logical/auth');
var contact = require('../logical/contact');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var photoViewer = this.photoViewer = new PhotoViewer();

        photoViewer.$el.hide().appendTo('body')
            .addClass('gl_beforeshow')
            .on($.fx.transitionEnd, function () {
                if (!photoViewer.$el.hasClass('gl_show')) {
                    photoViewer.$el.hide();
                }
            })
            .on('tap', function () {
                photoViewer.$el.removeClass('gl_show');
            });

        this.exitMenu = this.exitMenu.bind(this);

        var loader = this.loader = new Loader(this.$el);

        var model = self.model = new Model(this.$el, {
            title: '',
            messagesList: messagesList,
            user: user,
            tab: 1
        });

        model.openEnt = function () {
            bridge.openInApp('http://share.migu.cn/h5/api/h5/133/3223?channelCode=300000100002&cpsChannelId=300000100002&cpsPackageChannelId=300000100002');
        };

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

        model.onceTrue('change:tab', this.initAllQuan.bind(this));

        model.changeTab = function (tab) {
            this.set({
                tab: tab
            });
        }

        model.showYunMi = function () {
            popup.alert({
                className: 'ym_rules__popup',
                title: '云米规则',
                content: yunMiRules.rule2,
                btn: '关闭',
                action: function () {
                }
            })
        }

        model.toContact = function () {

            this.set({
                tab: 3

            }).next(function () {
                model._('quanTab').tab(2);
            });
        }

        model.showImages = function (imgs, index) {

            photoViewer.setImages(imgs.map(function (src) {
                return {
                    src: sl.resource(src)
                }
            }));
            photoViewer.index(index);

            photoViewer.$el.show()[0].clientHeight;
            photoViewer.$el.addClass('gl_show');
        }
        if (0)
            popup.popup({
                tapMaskToHide: true,
                tapToHide: true,
                className: 'bg_0000 hm_ym__present',
                content: '<div class="fs_s">恭喜您获得新人首<br>\
登福利100云米\
</div>'
            });


        this.bindScrollTo(model.refs.life);

        this.onceTrue('Show', function () {
            return auth.getAuthToken() && userLogical.getMe() ? true : false;
        });
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
        var self = this;

        bridge.qrcode.scan(function (res) {
            var code = res.code;

            if (code) {
                var m = code.match(/cmccfj\:\/\/user\/(\d+)/);
                if (m && m[1]) {
                    var user_id = parseInt(m[1]);
                    var isFriend = contact.isFriend(user_id);

                    if (isFriend)
                        self.forward('/contact/friend/' + user_id);
                    else
                        self.forward('/contact/person/' + user_id);
                }
            }

        });
    },

    loadPublicQuan: function () {

        var loader = this.loader;
        var model = this.model;
        var self = this;

        loader.showLoading();

        //publicquan.recommend(),
        //publicquan.myrecommend(),
        Promise.all([publicquan.myfollow()])
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
                    console.log(item);

                    if (item.pub_quan_msg && item.pub_quan_msg.imgs) {
                        item.pub_quan_msg.imgs = item.pub_quan_msg.imgs.split(',')
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

    initQuan: function (tab) {
        var self = this;
        var model = this.model;

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
        };

        model.likeQuanMsg = function (msg_id) {
            var msg = model.getModel('quanData').find('msg_id', msg_id);
            var likes = msg.getModel('quan_likes');

            if (likes && likes.find('user_id', user.data.user_id)) {
                Toast.showToast('你已点赞！');
                return;
            }

            quan.like(msg_id).then(function () {

                var res = {
                    user_id: user.get("user_id"),
                    user_name: user.get("user_name")
                }

                if (!likes) {
                    msg.set({
                        quan_likes: [res]
                    });

                } else {
                    likes.add(res);
                }

                Toast.showToast('点赞成功');

            }).catch(function (e) {
                Toast.showToast(e.message);
            });
        }
        self.loadQuan(tab.refs.items[1]);
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
                                item.imgs = item.imgs.split(',');

                            }
                        });
                        model.get("quanData").add(res.data);
                    });

                    results[1].data.forEach(function (item) {
                        if (item.imgs) {
                            item.imgs = item.imgs.split(',')
                        }
                    });

                    model.set({
                        quanData: results[1].data
                    })

                    console.log(model.data.quanData[0]);
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

    initAllQuan: function () {
        var self = this;
        var model = this.model;

        if (model.get('tab') == 3 && !self.tab) {

            model.next(function () {

                var tab = self.tab = this.refs.tab;
                var records = {};
                var count = 1;
                records[0] = true;

                model.set({
                    quanTab: tab
                });
                self.loadPublicQuan();

                tab.onceTrue('tabChange', function (e, index) {

                    if (records[index]) return;
                    records[index] = true;

                    count++;

                    switch (index) {
                        case 0:
                            break;

                        case 1:
                            self.initQuan(tab);
                            break;

                        case 2:
                            self.loadContacts();
                            break;
                    }

                    return count == 3;
                });
            });

            return true;
        }
    },


    onLoad: function () {

    },

    onShow: function () {
        var self = this;

        if (!auth.getAuthToken()) {
            self.forward('/login');

        } else {
            seajs.use(['logical/chat']);
            if (self.tab) {
                self.loadPublicQuan();
                self.quanLoader && self.loadQuan();
            }
        }
    },

    onHide: function () {
        this.exitMenu();
    },

    onDestory: function () {
        this.model.destory();
    }
});
