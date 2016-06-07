var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loading = require('../widget/loading');
var Slider = require('../widget/slider');
var Model = require('core/model2');
var Scroll = require('../widget/scroll');
var barcode = require('../util/barcode');
var animation = require('animation');
var Confirm = require("components/confirm");
var api = require("models/base");
var userModel = require("models/user");
var ViewModel = Model.ViewModel;

var Discovery = require('./discovery/discovery_index');

Model.State.set({
    cartQty: 0
});

var cartQtyApi = new api.CartQtyAPI({
    $el: $(''),
    checkData: false,
    success: function (res) {
        Model.State.set({
            cartQty: res.data
        });
    },
    error: function () {
    }
});

module.exports = Activity.extend({
    events: {
        'tap .head_tab li': function (e) {
            this.model.set('tab', $(e.target).index());
        },
        'tap .home_tip_mask': function (e) {
            util.store('showTipStep', 2);
            this.model.set({ showTipStep: 2 });
        },
        'tap .open_msg': function (e) {
            if ($(e.target).hasClass('open_msg')) {
                $(e.target).removeClass('show');
            }
        },
        'tap .js_offline .btn': function () {
            this.requestUser();
        },
        'tap .js_comment_list [data-id]': function (e) {
        },
        'tap .rainbow_bd': function (e) {
            this.$('.footer li').eq(3).trigger('tap');
        },
        'tap .footer li': function (e) {
            var self = this;
            var $target = $(e.currentTarget);
            var index = $target.index();

            if (!$target.hasClass('curr')) {
                $target.addClass('curr').siblings('.curr').removeClass('curr');

                this.model.set({
                    bottomTab: index
                });

                if (index == 1) {
                    if (!this.model.data.baiduMap) {
                        this.model.set('baiduMap', '<iframe class="js_baidu_map" src="' + bridge.url("/baiduMap.html?v4") + '" frameborder="0" ></iframe>');
                        this.$baiduMap = this.$('.js_baidu_map').css({ width: window.innerWidth, height: window.innerHeight - 47 - 44 - (util.isInApp ? 20 : 0) });
                    }

                    bridge.getLocation(function (res) {
                        self.$baiduMap[0].src = bridge.url("/baiduMap.html?v3#longitude=" + res.longitude + "&latitude=" + res.latitude);
                    });

                } else if (index == 2) {
                    if (!self.discovery) {
                        self.discovery = new Discovery();

                        self.discovery.$el.appendTo(self.model.refs.discovery)
                    }
                } else if (index == 3) {

                    if (!self.recDiscovery) {
                        self.recDiscovery = new api.RecDiscoveryAPI({
                            $el: self.model.refs.messages,
                            success: function (res) {
                                console.log(res);

                                self.model.set({
                                    rec: res.data
                                })
                            },

                            error: function () {
                            }
                        });

                        self.recDiscovery.load();
                    }
                }
            }
        },
        'touchstart .hm_tab_con': function (e) {
            var self = this;

            this.pointY = this.startY = e.touches[0].pageY;
            this.pointX = this.startX = e.touches[0].pageX;

            this.isTouchStop = false;
            this.isTouchStart = false;
            this.isTouchMoved = false;

            this.x = !self.model.data.tab ? 0 : -window.innerWidth;
            this.x1 = !self.model.data.tab ? window.innerWidth : 0;
        },
        'touchmove .hm_tab_con': function (e) {
            var self = this,
                pointX = e.touches[0].pageX,
                pointY = e.touches[0].pageY;

            var deltaX = self.startX - pointX,
                deltaY = self.startY - pointY;

            if (!self.isTouchStart) {
                var isDirectionX = Math.abs(deltaX) > 0 && Math.abs(deltaX) > Math.abs(deltaY);

                if (isDirectionX) {
                    self.isTouchStart = true;
                    self.isDirectionX = isDirectionX;

                } else {
                    self.isTouchStop = true;
                    return;
                }
            }

            var x = Math.max(-window.innerWidth, Math.min(0, this.x - deltaX));
            var x1 = Math.max(0, Math.min(window.innerWidth, this.x1 - deltaX));

            self.moveX = x;

            self.$tabs.eq(0).css({
                '-webkit-transform': 'translate(' + x + 'px,0px)',
                '-webkit-transition': '0ms'
            });
            self.$tabs.eq(1).css({
                '-webkit-transform': 'translate(' + x1 + 'px,0px)',
                '-webkit-transition': '0ms'
            });

            this.dir = this.pointX - pointX > 0 ? 'left' : 'right';

            this.pointX = pointX;
            this.pointY = pointY;

            self.isTouchMoved = true;
        },
        'touchend .hm_tab_con': function (e) {
            var self = this;

            if (!self.isTouchMoved) return;
            self.isTouchMoved = false;

            if (self.isTouchStop) return;
            self.isTouchStop = true;

            $(e.target).trigger('touchcancel');

            self.$tabs.css({
                '-webkit-transition': '-webkit-transform 300ms ease-out 0ms'
            }).each(function () {
                this.clientHeight;
            });

            if (self.moveX != this.x) {
                self.model.set({
                    tab: !self.model.data.tab ? 1 : 0
                })
            }

            return false;
        },
        'tap .guide1': function () {
            this.model.set({
                showGuide: false
            })
        }
    },

    className: 'home',

    onCreate: function () {
        var self = this;
        self.user = userModel.get();
        self.$tabs = self.$('.hm_tab_con');

        self.$tabs.on($.fx.transitionEnd, function () {
            if (self.model.data.tab == 1 && self.slider) {
                setTimeout(function () {
                    self.slider._adjustWidth();
                }, 400)
            }
        })

        sl.activity = self;

        var model = this.model = new ViewModel(this.$el, {
            menu: 'head_menu',
            titleClass: 'head_title',
            isOffline: false,
            isLogin: !!self.user,
            isFirstOpen: util.store('isFirstOpen') === null,
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

        model.showSearch = function () {
            this.set({
                isShowSearch: true
            });
            $(this.refs.searchwrap).show();

            this.refs.searchText.focus();
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

        self.appIconAPI = new api.AppIconAPI({
            $el: $(''),
            checkData: false,
            params: {
                id: 2
            },
            success: function (res) {
                console.log(res);
            }
        });

        self.appIconAPI.load();

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
            error: function () {
            }
        });
        update.load();

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
                    self.slider = new Slider(model.refs.topbanner, {
                        loop: true,
                        autoLoop: 3000,
                        data: res.topbanner.data,
                        dots: true,
                        itemTemplate: '<img src="<%=src%>" data-forward="<%=url%>?from=%2f" />'
                    });

                Scroll.bind(self.$('.js_shop_scroll:not(.s_binded)').addClass('s_binded'), {
                    vScroll: false,
                    hScroll: true,
                    useScroll: true
                });

                if (model.data.tab == 1) {
                    self.scroll.get('.js_shop').imageLazyLoad();
                }

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


        model.on('change:tab', function () {
            if (this.data.tab == 1) {
                self.scroll.get('.js_shop').imageLazyLoad();
            }
        })

        if (!util.store('IS_SHOW_GUIDE')) {

            util.store('IS_SHOW_GUIDE', 1);

            model.set('showGuide', true);

            this.guideSlider = new Slider(self.$('.hm_guide'), {
                itemTemplate: '<img class="guide<%=id%>" src="http://appuser.abs.cn/dest1.2.0/images/guide<%=id%>.jpg" />',
                data: [{
                    id: 0
                }, {
                        id: 1
                    }],
                onChange: function (index) {
                }
            });
        }

        Scroll.bind(this.$('.main:not(.js_shop)'));

        this.scroll = Scroll.bind(this.$('.js_shop'), {
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
        Scroll.bind(self.$open_msg.find('.msg_bd'));

        var canvas = this.$('.js_canvas')[0];
        canvas.width = 170;
        canvas.height = 170;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

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
            self.user = userModel.get();

            model.set({
                isOffline: false,
                user: self.user
            });
            self.doWhenLogin();

        }).onResult("UserChange", function () {
            self.requestUser();

        }).onResult("Logout", function () {
            self.user = null;
            model.set({
                isLogin: false,
                user: null
            });
        }).onResult('CartChange', function () {

            self.getCartQty();
        });

        setInterval(function () {
            self.getUnreadMsg();

        }, 10000);

        this.listenTo($(this.model.refs.search), 'keydown', function (e) {
            if (e.keyCode == 13) {
                self.forward('/discovery/list?s=' + encodeURIComponent(e.target.value) + '&from=/');
                e.preventDefault();
                return false;
            }
        });

        this.listenTo($(this.model.refs.searchText), 'keydown', function (e) {
            if (e.keyCode == 13) {

                model.search(e, e.target.value);
                e.preventDefault();
                return false;
            }
        });

        model.search = function (e, item) {
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

    getCartQty: function () {
        if (this.user.PSP_CODE) {
            cartQtyApi.setParam({
                pspcode: this.user.PSP_CODE

            }).load();
        }
    },

    requestUser: function () {
        var self = this;

        userModel.request(function (err, res) {

            if (err) {
                if (err.error_code == 503) {
                    userModel.set(null);
                    self.model.set('isLogin', false);
                }
                self.model.set('isOffline', true);
                return;
            }
            userModel.set(res.data);

            self.user = userModel.get();

            self.model.set({
                isOffline: false,
                user: self.user
            });

            self.getCartQty();

            self.showEnergy();
            self.stewardQtyApi.setParam({
                pspcode: self.user.PSP_CODE
            }).load();

            if (res.vdpMessage) {
                self.showMessageDialog(res.vdpMessage);
                //util.store('ivcode', null);
            }
        }, util.store('ivcode') || '0000');
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

    _angleFrom: 0,

    drawCircle: function (percent) {
        if (!this._angleFrom) {
            this._angleFrom = 1.5 * Math.PI;
        }
        var angleTo = Math.floor((1.5 + 2 * percent) * 1000) / 1000 * Math.PI;

        var context = this.context;
        var canvas = this.canvas;
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = centerX - 10;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.arc(centerX, centerY, radius, this._angleFrom, angleTo, false);
        context.lineWidth = 19;
        context.strokeStyle = '#fff';
        context.stroke();

        //this._angleFrom = angleTo;
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
            animation.animate(function (d) {
                var num = Math.round(animation.step(0, total, d));

                self.model.set('energyAnimNum', num);
                self.drawCircle(animation.step(0, percent, d));

            }, 800, 'ease-out')

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
                    self.model.set('msg_count', res.count);
                }

            }, 'json');
        }
    },

    doWhenLogin: function () {
        var self = this;
        var user = userModel.get();

        self.model.set({
            barcode: barcode.code93(user.Mobile).replace(/0/g, '<em></em>').replace(/1/g, '<i></i>'),
            isLogin: true
        });

        var load = function (token) {

            userModel.setParam({
                IMEI: !token ? 'CAN_NOT_GET' : (typeof token == 'string' ? token : token.imei)
            });
            self.requestUser();
        }

        util.isInApp ? bridge.getDeviceToken(load) : load();
    },

    onLoad: function () {

        if (this.user) {
            this.showEnergy();
            this.doWhenLogin();
        }
    },

    onShow: function () {
        var self = this;

        this.setResult('ResetCart');

        this.guideSlider && this.guideSlider._adjustWidth();
    },

    onPause: function () {
    },

    onQueryChange: function () {
        if (this.query.tab) {
            this.$('.footer li:nth-child(1)').trigger('tap');
            this.model.set({
                tab: this.query.tab
            });
        }
    },

    onDestory: function () {
    }
});
