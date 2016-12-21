var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loading = require('../widget/loader');
var Slider = require('../widget/slider');
var vm = require('core/model2');
var Model = vm.Model;
var Global = vm.Global;
var Scroll = require('../widget/scroll');
var barcode = require('../utils/barcode');
var animation = require('animation');
var Confirm = require("components/confirm");
var api = require("models/api");
var userModel = require("models/user");
var Category = require("models/category");
var CpCategory = require("components/category");
var Cart = require("components/cart");

var Album = require("widget/album");

var Discovery = require('./discovery/discovery_index');

var trimHash = require('core/route').formatUrl;

Global.set({
    msg_count: 0,
    cartQty: 0
});

var cartQtyApi = new api.CartQtyAPI({
    checkData: false,
    success: function (res) {
        Global.set({
            cartQty: res.data
        });
    },
    error: function () { }
});

var recordVersion = util.store('recordVersionTime');

if (!recordVersion || Date.now() - recordVersion > 24 * 60 * 60 * 1000) {
    util.store('recordVersionTime', Date.now());

    var historyRecord = new api.HistoryRecord({
        success: function (res) {
            console.log(res);
        },
        error: function () { }
    });
    var user = userModel.get();

    bridge.system.info(function (res) {

        historyRecord.setParam({
            pspid: user ? user.ID : 0,
            appversion: sl.appVersion,
            device: res.deviceName,
            deviceversion: (util.ios ? "IOS" : "Android") + util.osVersion,
            uuid: res.uuid

        }).load();
    });
}

module.exports = Activity.extend({
    events: {
        'tap .home_tip_mask': function (e) {
            util.store('showTipStep', 2);
            this.model.set({
                showTipStep: 2
            });
        },

        'tap .open_msg': function (e) {
            if ($(e.target).hasClass('open_msg')) {
                $(e.target).removeClass('show');
            }
        },

        'tap .js_offline .btn': function () {
            this.requestUser();
        },

        'tap .guide1': function () {
            this.model.set({
                showGuide: false
            })
        }
    },

    className: 'home',

    showDiscovery: function () {
        if (!this.model.get('isLogin')) {
            this.forward('/login');
            return;
        }

        if (this.model.get('bottomTab') != 2) {

            if (!this.discovery) {
                this.discovery = new Discovery();
                this.discovery.$el.appendTo(this.model.refs.discovery)
            }

            this.model.set({
                bottomTab: 2
            });
            this.queryString('tab', 2);
        }
    },

    showMap: function () {
        this.forward('/map')
    },

    showCart: function () {
        var data = this.model.data;

        if (data.isLogin) {

            if (data.bottomTab != 3) {

                if (!this.cart) {
                    var cart = this.cart = new Cart();

                    this.model.set({
                        cart: cart
                    });
                    cart.$el.appendTo(this.model.refs.cart);
                } else {
                    this.cart.cartApi.load();
                }

                this.model.set({
                    bottomTab: 3
                });

                this.queryString('tab', 3);
            }

        } else {
            self.forward('/login');
        }
    },

    startMakeLog: function () {
        var self = this;

        var makeLog = function () {
            var hash = trimHash(location.hash);

            bridge.system.info(function (res) {
                var image = new Image();
                var deviceversion = (util.ios ? "IOS" : "Android") + util.osVersion;

                image.src = api.ShopAPI.prototype.baseUri + "/api/system/addpagests?pspcode=" + (self.user ? self.user.PSP_CODE : '') + "&pageurl=" + encodeURIComponent(hash) + "&appversion=" + sl.appVersion + "&uuid=" + res.uuid + "&deviceversion=" + deviceversion;
            });
        }
        makeLog();
        $(window).on('hashchange', makeLog)

        $('.viewport').on('touchstart', function (e) {
            var hash = trimHash(location.hash);

            bridge.system.info(function (res) {
                var image = new Image();
                var deviceversion = (util.ios ? "IOS" : "Android") + util.osVersion;

                image.src = api.ShopAPI.prototype.baseUri + "/api/system/addpagests?pspcode=" + (self.user ? self.user.PSP_CODE : '') + "&pageurl=" + encodeURIComponent(hash) + "&appversion=" + sl.appVersion + "&uuid=" + res.uuid + "&deviceversion=" + deviceversion + "&coordx=" + e.touches[0].pageX + "&coordy=" + e.touches[0].pageY;
            });
        });
    },

    getOrderCount: function () {
        var self = this;
        new Loading({
            url: '/api/order/getCounts',
            params: {
                UserID: self.user.ID,
                Auth: self.user.Auth
            }

        }).request().then(function (res) {

            self.model.set({
                order1num: res.data[0],
                order2num: res.data[1],
                order3num: res.data[2],
            });
        });
    },

    onCreate: function () {
        var self = this;
        self.user = userModel.get();
        self.$tabs = self.$('.hm_tab_con');


        console.log("home onCreate");

        sl.activity = self;

        this.startMakeLog();

        //var album = new Album();
        //album.$el.appendTo($('body'));

        var model = this.model = new Model(this.$el, {
            menu: 'head_menu',
            titleClass: 'head_title',
            isOffline: false,
            isLogin: !!self.user,
            isStart: self.query.start == 1,
            msg: 0,
            tab: 0,
            bottomTab: 0,
            chartType: 0,
            open: function () {
                bridge.openInApp(self.user.OpenUrl || 'http://m.abs.cn');
            },
            openUrl: function (e, url) {
                bridge.openInApp(url || 'http://m.abs.cn');
            },
            searchHistory: util.store("searchHistory")
        });



        this.model.showHome = function () {
            if (this.data.bottomTab != 0) {
                this.set({
                    bottomTab: 0
                });
                self.queryString('tab', 0);
            }
        };
        this.model.showDiscovery = this.showDiscovery.bind(this);
        this.model.showMap = this.showMap.bind(this);
        this.model.showCart = this.showCart.bind(this);

        this.model.showMe = function () {

            if (this.data.isLogin) {
                if (this.get('bottomTab') != 4) {
                    self.getOrderCount();
                }
                this.set({
                    bottomTab: 4
                });
                self.queryString('tab', 4);
            } else {
                self.forward('/login');
            }
        };

        model.showSearch = function (e) {
            this.set({
                isShowSearch: true
            });
            $(this.refs.searchwrap).show();

            this.refs.searchText.focus();

            e.preventDefault();
            e.stopPropagation();
        }

        model.clearSearch = function () {
            util.store("searchHistory", null);

            this.set({
                searchHistory: null
            });
        }

        model.hideSearch = function () {
            this.set({
                isShowSearch: false
            });
            this.refs.searchText.blur();

            $(this.refs.searchwrap).hide();
        }

        self.hotSearchAPI = new api.HotSearchAPI({
            checkData: false,
            success: function (res) {

                self.model.set({
                    hotSearch: res.data
                });
            }
        });

        self.hotSearchAPI.load();

        var update = new api.UpdateAPI({
            checkData: false,
            params: {
                version: sl.appVersion,
                platform: util.ios ? 1 : 2
            },
            success: function (res) {

                if (res.success && res.data.AVS_UPDATE_URL) {
                    var confirm = new Confirm({
                        content: res.data.AVS_UPDATE_MSG,
                        alwaysOpen: res.data.AVS_FORCE_FLAG,
                        confirm: function () {
                            bridge.update(res.data.AVS_UPDATE_URL, res.data.AVS_VERSION);
                        }
                    });
                    confirm.$el.appendTo($('body'));
                    confirm.show();
                }
            },
            error: function () { }
        });
        update.request().catch(function () { });

        this.stewardQtyApi = new api.StewardQtyAPI({
            checkData: false,
            success: function (res) {
                self.user.StewardNum = res.data;
                userModel.set(self.user);
                model.set('user.StewardNum', res.data);
            }
        });

        this.launchLoading = new Loading({
            url: '/api/settings/ad_list?name=launch&type=base64',
            check: false,
            checkData: false,
            success: function (res) {
                if (res && res.data && res.data.length) {
                    localStorage.setItem('LAUNCH_IMAGE', res.data[0].Src);
                }
            }
        });
        this.launchLoading.load();

        self.shopApi = new api.ActivityAPI({
            $el: self.$('.hm_shop'),
            success: function (res) {

                model.set({
                    activity: res.data,
                    topbanner: res.topbanner
                });

                if (self.slider)
                    self.slider.set(res.topbanner.data);
                else
                    self.slider = new Slider({
                        loop: true,
                        container: model.refs.topbanner,
                        autoLoop: 3000,
                        data: res.topbanner.data || [],
                        dots: true,
                        itemTemplate: '<img data-src="<%=src%>" data-forward="<%=url%>?from=%2f" />'
                    });

                model.one('viewDidUpdate', function () {
                    self.bindScrollTo(self.$('.js_shop_scroll:not(.s_binded)').addClass('s_binded'), {
                        vScroll: false,
                        hScroll: true,
                        useScroll: true
                    });
                    self.scroll && self.scroll.get('.js_shop').imageLazyLoad();
                });


                this.showMoreMsg('别拉了，就这些<i class="ico_no_more"></i>');
            }
        });

        self.shopApi.load();

        new api.ShopAPI({
            url: '/api/prod/newproductlist',
            checkData: false,
            check: false,
            success: function (res) {
                if (res.success) {
                    model.set({
                        newproducts: res.data
                    });
                }

            },
            error: function () {

            }
        }).load();

        this.bindScrollTo(model.refs.cates, {
            useScroll: true,
            vScroll: false,
            hScroll: true
        });

        model.showCategories = function () {
            self.cpCategory.show();
        }

        Category.request(function () {

            Category.list(function (res, navs) {

                res = util.find(res, function (item) {
                    return item.children;
                })

                model.set({
                    navs: navs,
                    categories: res
                });

                var cpCategory = new CpCategory({
                    data: res,
                    isHome: true,
                    goto: function (e, id) {
                        cpCategory.hide();
                        self.forward("/all?id=" + id);
                    }
                });

                cpCategory.$el.appendTo('body');

                self.cpCategory = cpCategory;
            });
        });

        if (!util.store('IS_SHOW_GUIDE')) {

            util.store('IS_SHOW_GUIDE', 1);

            model.set('showGuide', true).next(function () {
                self.guideSlider = new Slider({
                    container: self.$('.hm_guide'),
                    itemTemplate: '<img class="guide<%=id%>" src="http://appuser.abs.cn/dest1.2.0/images/guide<%=id%>.jpg" />',
                    data: [{
                        id: 0
                    }, {
                        id: 1
                    }],
                    onChange: function (index) { }
                });
            });
        }

        this.bindScrollTo(this.$('.main:not(.js_shop)'));

        this.scroll = this.bindScrollTo(this.$('.js_shop'), {
            refresh: function (resolve, reject) {
                self.shopApi.load(function () {
                    resolve();
                });
            }
        });

        self.$open_msg = this.$('.open_msg').on($.fx.transitionEnd, function (e) {
            if (!self.$open_msg.hasClass('show')) {
                self.$open_msg.hide();
            }
        });
        this.bindScrollTo(self.$open_msg.find('.msg_bd'));

        var $launchImgs = this.$('.launch img');
        var $mask = this.$('.home_mask').on($.fx.transitionEnd, function (e) {
            if ($mask.hasClass('toggle')) {
                $mask.removeClass('toggle');

                var $el = $launchImgs.filter(':not(.launch_hide)').addClass('launch_hide');

                $launchImgs.eq($el.index() + 1 == $launchImgs.length ? 0 : ($el.index() + 1)).removeClass('launch_hide');
            }
        });

        setTimeout(function () {
            $mask.addClass('toggle');

            setTimeout(arguments.callee, 3200)
        }, 3200);

        self.onResult("Login", function () {
            var user = self.user = userModel.get();

            self.model.set({
                isLogin: true,
                isOffline: false,
                user: user
            });

            self.doWhenLogin();
            self.refreshCart();

        }).onResult("UserChange", function () {
            self.requestUser();

        }).onResult("Logout", function () {
            self.user = null;
            userModel.set(null);
            model.set({
                isLogin: false,
                user: null
            });
            self.$('.footer li:nth-child(1)').trigger('tap');

        }).onResult('CartChange', function () {
            self.refreshCart();
        });

        setInterval(function () {
            self.getUnreadMsg();

        }, 30000);

        this.listenTo($(this.model.refs.search), 'keydown', function (e) {
            if (e.keyCode == 13) {
                self.forward('/discovery/list?s=' + encodeURIComponent(e.target.value) + '&from=/');
                e.preventDefault();
                return false;
            }
        });

        this.listenTo($(this.model.refs.searchText), 'keydown', function (e) {
            if (e.keyCode == 13) {

                model.search(e.target.value);
                e.preventDefault();
                return false;
            }
        });

        model.search = function (item) {
            var searchHistory = util.store('searchHistory') || [];
            var index = searchHistory.indexOf(item);

            if (index != -1) {
                searchHistory.splice(index, 1);
            }
            searchHistory.unshift(item);

            self.model.set({
                searchHistory: searchHistory
            });
            util.store('searchHistory', searchHistory);

            self.forward('/list?s=' + encodeURIComponent(item) + '&from=/');
        }

    },

    refreshCart: function () {
        if (this.user.PSP_CODE) {
            if (this.cart)
                this.cart.cartApi.load();
            else
                cartQtyApi.setParam({
                    pspcode: this.user.PSP_CODE

                }).load();

            if (this.model.get('bottomTab') == 4) {
                this.getOrderCount();
            }
        }
    },

    requestUser: function () {
        var self = this;

        userModel.request(util.store('ivcode') || '0000').then(function (res) {
            res.data.ID = res.data.UserID;


            userModel.set(res.data);

            var user = self.user = userModel.get();

            self.model.set({
                barcode: barcode.code93(user.Mobile).replace(/0/g, '<em></em>').replace(/1/g, '<i></i>'),
                isLogin: true,
                isOffline: false,
                user: self.user
            });

            self.refreshCart();

            self.showEnergy();
            self.stewardQtyApi.setParam({
                pspcode: self.user.PSP_CODE
            }).load();

            if (res.vdpMessage) {
                self.showMessageDialog(res.vdpMessage);
                //util.store('ivcode', null);
            }

            util.isInApp && bridge.getDeviceToken(function (token) {

                if (token) {
                    new api.API({
                        params: {
                            UserID: user.ID,
                            Auth: user.Auth,
                            IMEI: !token ? 'CAN_NOT_GET' : (typeof token == 'string' ? token : token.token)
                        },
                        url: '/api/user/deviceToken',
                        success: function () { },
                        error: function () { }

                    }).load();
                }
            });

        }, function (err) {
            console.log(err);
            if (err) {
                if (err.error_code == 503) {
                    userModel.set(null);
                    self.model.set('isLogin', false);
                }
                self.model.set('isOffline', true);
                return;
            }
        });
    },

    showMessageDialog: function (message) {
        var self = this;
        self.model.set('showTipStep', 1);
        self.$open_msg.show();
        self.$open_msg[0].clientHeight;
        self.$open_msg.addClass('show');

        self.model.set({
            message: message
        });
    },

    showEnergy: function () {
        if (!this.user) return;

        var self = this;
        var total = Math.round(this.user.Amount);
        var percent = 1;
        var level;
        var nextLevel;
        var currentLevel;
        var levelAmounts;
        var levels = ['银卡会员', '金卡会员', '钻石会员', 'VIP会员', 'SVIP会员', '无敌会员'];

        self.model.set('vip', total < (levelAmounts = 1000) ? (level = 0, currentLevel = 0, nextLevel = 1000, levels[1]) : total < (levelAmounts = 5000) ? (level = 1, currentLevel = 1000, nextLevel = 5000, levels[2]) : total < (levelAmounts = 10000) ? (level = 2, currentLevel = 5000, nextLevel = 10000, levels[3]) : total < (levelAmounts = 50000) ? (level = 3, currentLevel = 10000, nextLevel = 50000, levels[4]) : (level = 4, nextLevel = '0', levels[5]));

        percent = Math.min(1, total / levelAmounts);

        self.model.set({
            nextLevel: nextLevel,
            currentLevel: currentLevel,
            vipName: levels[level],
            levelAmounts: levelAmounts,
            energyPercent: percent * 100 + '%',
            ucCardAmounts: util.formatMoney(total) + (total > 50000 ? '' : ('/' + util.formatMoney(levelAmounts)))
        });

        if (total != self.model.data.energy) {
            self.model.set({
                energy: total
            });
        }
    },

    getUnreadMsg: function () {
        var self = this;

        if (self.user && self.user.Auth) {
            $.post(bridge.url('/api/user/get_unread_msg_count'), {
                UserID: self.user.ID,
                Auth: self.user.Auth

            }, function (res) {
                if (res.success) {
                    Global.set('msg_count', res.count)
                }

            }, 'json');
        }
    },

    doWhenLogin: function () {
        var self = this;

        userModel.setParam({
            IMEI: ""
        });
        self.requestUser();
    },

    onShow: function () {
        var self = this;

        if (this.user) {
            this.showEnergy();
            this.doWhenLogin();
        }

        setTimeout(function () {
            self.guideSlider && self.guideSlider.adjustWidth();

        }, 0);

        if (self.model.data.tab == 0) {
            self.slider && setTimeout(function () {
                self.slider.adjustWidth();
            }, 400);

            self.scroll && self.scroll.get('.js_shop').imageLazyLoad();
        }
    },

    onPause: function () { },

    onQueryChange: function () {

        if (this.query.tab === '0') {
            this.$('.footer li:nth-child(1)').trigger('tap');
        }
        this.model.set({
            isStart: this.query.start == 1
        });
    },

    onDestroy: function () { }
});