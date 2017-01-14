var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loader = require('../widget/loader');
var Model = require('core/model2').Model;
var Http = require('core/http');
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

var friends = require('models/friends');
var appconfig = require('models/appconfig');

var userLogical = require('../logical/user');
var ym = require('logical/yunmi');
var auth = require('../logical/auth');
var contact = require('../logical/contact');
var business = require('../logical/business');
var chat = require('../logical/chat');
var news = require('../logical/news');
var redirect = business.redirect;
var businessModel = require('models/business');
var businessGroup = businessModel.getGroups();

//require('test_notification');

module.exports = Activity.extend({

    events: {
        'tap [data-url]': function(e) {
            var url = $(e.currentTarget).attr('data-url');

            redirect.jump(url);
        }
    },

    onCreate: function() {

        // $.ajax({
        //     type: 'POST',
        //     url: "http://bmsh.wxcs.cn/manage/notification/receiveWeibo",
        //     contentType: 'application/json',
        //     data: JSON.stringify({ "operation_in": { "content": { "request": { "request_time": "20161229163841714", "request_seq": "329503856438", "msisdn": "15705958061", "notify_type": "2", "notify": { "home_city": "592", "dun_type": "2", "useble_balance": "1970", "special_balance": "990", "unuseble_balance": "0", "pre_month_owing": "0", "this_month_owing": "0", "lagging": "0", "defer_cycle": "2", "defer_limit_amout": "10000" } } } } })
        // });

        var self = this;

        /*
        var exists = function (i) {
            console.log('exists', i);
            return i <= 599 ? true : false;
        }
        setTimeout(function () {
            userLogical.getLatestVersion();
        }, 1000);

        //二分法查找
        var length = 1003;

        var rangeStart = 1;
        var rangeEnd = length - 2;
        var cursor = parseInt((rangeEnd - rangeStart) / 2);
        var result = 0;

        while (true) {

            if (!exists(cursor)) {

                if (exists(--cursor)) {
                    result = cursor + 1;
                    break;

                } else if (rangeStart == cursor) {
                    result = cursor;
                    break;
                }
                rangeEnd = cursor - 1;

            } else {
                if (!exists(++cursor)) {
                    result = cursor;
                    break;

                } else if (cursor == rangeEnd) {
                    result = cursor;
                    break;
                }

                rangeStart = cursor + 1;
            }

            if (rangeEnd == rangeStart) {
                console.log('match', rangeStart)
                result = exists(rangeStart) ? rangeStart + 1 : rangeStart;
                break;

            } else if (rangeEnd < rangeStart) {
                console.log('error', rangeStart, rangeEnd)
                break;
            }

            cursor = rangeStart + parseInt((rangeEnd - rangeStart) / 2);
            console.log("cursor:", rangeStart, rangeEnd, cursor)

            if (cursor <= 0) {
                console.log('error match')
                break;
            }
        }

        console.log(result, cursor);
        */

        var photoViewer = this.photoViewer = new PhotoViewer();

        photoViewer.$el.hide().appendTo('body')
            .addClass('g_beforeshow')
            .on($.fx.transitionEnd, function() {
                if (!photoViewer.$el.hasClass('g_show')) {
                    photoViewer.$el.hide();
                }
            })
            .on('tap', function() {
                photoViewer.$el.removeClass('g_show');
            });

        this.exitMenu = this.exitMenu.bind(this);

        var loader = this.loader = new Loader(this.$el);

        var model = self.model = new Model(this.$el, {
            title: '',
            messagesList: messagesList,
            user: user,
            tab: 1,
            recommendIndex: 0,
            business: businessGroup,
            friends: friends
        });

        model.delegate = this;

        model.getUserShowName = friends.getUserShowName;

        model.openEnt = function() {
            bridge.tab.show('http://share.migu.cn/h5/api/h5/133/2848?channelCode=1380050700381&cpsChannelId=300000100002&cpsPackageChannelId=300000100002', 2);
        };

        model.openShop = function() {
            console.log(appconfig.get('shopUrl'));
            bridge.tab.show(appconfig.get('shopUrl'), 3);
        }

        function hideTab(id) {
            if (model.get('tab') != id) {
                model.set({
                    tab: id,
                    headBg: false
                });

                setTimeout(function() {
                    bridge.tab.hide();
                }, 200);
            } else
                bridge.tab.hide();
        }

        $(window).on('ent_to_home', function() {
            hideTab(1)

        }).on('ent_to_quan', function() {
            hideTab(3)

        }).on('tabchange_to_2', function() {
            model.openEnt();

        }).on('tabchange_to_3', function() {
            model.openShop();
        });

        model.showQuanMenu = function() {
            $(this.refs.quanMenuMask).show();
            $(this.refs.quanMenu).show();
        }

        model.hideQuanMenu = function(url, e) {
            $(this.refs.quanMenuMask).hide();
            $(this.refs.quanMenu).hide();

            if (typeof url == 'string') {
                self.forward(url);
            }
        }
        model.exitMenu = function(e) {
            if ($(e.target).hasClass('hm_home'))
                self.exitMenu();
        }

        model.backup = function() {
            self.forward('/contact/backup');
            return false;
        }

        model.onceTrue('change:tab', this.initAllQuan.bind(this));

        model.changeTab = function(tab) {
            this.set({
                tab: tab
            });
        }

        model.phoneCall = function() {
            self.forward('/hdh/call')
        }

        model.showYunMi = function() {
            popup.alert({
                className: 'ym_rules__popup',
                title: '云米规则',
                content: yunMiRules.rule2,
                btn: '关闭',
                action: function() { }
            })
        }

        model.toContact = function() {
            this.set({
                tab: 3

            }).next(function() {
                model._('quanTab').tab(2);
            });
        }

        model.showImages = function(imgs, index) {

            photoViewer.setImages(imgs.map(function(src) {
                return {
                    src: sl.resource(src)
                }
            }));
            photoViewer.index(index);

            photoViewer.$el.show()[0].clientHeight;
            photoViewer.$el.addClass('g_show');
        }

        model.hideTimeout = function() {
            $(model.refs.timeout).hide();
            $(model.refs.timeoutMask).hide();
        }

        model.receiveYunmi = function() {
            var data = this.get('currentYunmi');

            if (!data || !data.yunmi_id) {
                if (this.get('next.yunmi_id')) {
                    $(model.refs.timeout).show();
                    $(model.refs.timeoutMask).show();

                } else {
                    Toast.showToast('暂无云米可以领取！');
                }
                return;
            }

            loader.showLoading();

            ym.receiveYunmi(data.yunmi_id).then(function(res) {
                Toast.showToast("恭喜你领取了" + data.amount + "云米");
                model.set({
                    currentYunmi: null
                });

            }).catch(function(e) {
                Toast.showToast(e.message);

            }).then(function() {
                loader.hideLoading();
            });
        }

        this.bindScrollTo(model.refs.life);

        $(model.refs.life).on('scroll', function() {
            var top = this.scroll.scrollTop();

            if (top >= 116 * window.innerWidth / 320) {
                model.set({
                    headBg: true
                });
            } else {
                model.set({
                    headBg: false
                });
            }
        });

        this.onResult('LOGOUT', this.bindOnceLogin);
        this.bindOnceLogin();

    },

    bindOnceLogin: function() {

        this.onceTrue('Show', function() {
            if (auth.getAuthToken() && userLogical.getMe()) {

                if (!this.banner) {
                    this.banner = true;
                    var self = this;

                    news.getHomeBanner().then(function(res) {
                        self.slider = new Slider({
                            loop: true,
                            container: self.model.refs.banner,
                            autoLoop: 3000,
                            data: util.map(res.data, ['image', 'linkurl']) || [],
                            dots: true,
                            itemTemplate: '<a href="javascript:;" data-url="<%=linkurl%>"><img src="<%=sl.resource(image)%>" /></a>'
                        });
                        self.model.next(function() {
                            self.slider.adjustWidth();
                        })
                    });
                }

                contact.friends();

                chat.on('NEW_NOTIFICATIONS_COMING', function() {
                    business.getAllBusinessAndUnread();
                });
                business.getAllBusinessAndUnread();

                bridge.getDeviceToken(function(res) {
                    var token = res.token;
                    var storedToken = util.store('device_token');
                    if (token != 'get_token_failure' && token != storedToken) {
                        userLogical.updateDeviceToken(token).then(function() {
                            util.store('device_token', token);
                        });
                    }
                });
                return true;
            }
            return false;
        });
    },

    getYunmi: function() {
        var model = this.model;
        var self = this;

        ym.getYunmi().then(function(res) {
            var current = res.data;
            var next = res.next;

            if (next) {
                var serverNow = next.create_date;
                var now = Date.now();

                next.timeFix = now - serverNow;
                next.timeLeft = util.timeLeft(next.start_date - serverNow);

                self.timer = setInterval(function() {
                    if (location.hash != '#/') return;

                    var next = model.get('next');
                    var timeLeft = next.start_date - (Date.now() - next.timeFix);

                    if (timeLeft <= 0) {
                        if (self.timer) {
                            clearInterval(self.timer);
                            self.timer = null;
                        }
                        self.getYunmi();
                        model.hideTimeout();
                        return;
                    }

                    timeLeft = util.timeLeft(timeLeft);

                    model.set('next.timeLeft', timeLeft);

                }, 1000);
            }

            model.set({
                currentYunmi: current,
                next: next
            });
        });
    },

    menu: function() {

        var self = this;

        if (!this._menu) {
            this._menu = new Menu();
            this._menu.$el.prependTo(this.$el)[0].clientHeight;
        }

        requestAnimationFrame(function() {

            $(self.model.refs.home).addClass('menu_aexit');
            self._menu.$el.addClass('menu_enter');
        });

        Application.addBackAction(this.exitMenu);
    },

    exitMenu: function() {
        this._menu && this._menu.$el.removeClass('menu_enter');
        $(this.model.refs.home).removeClass('menu_aexit');
        Application.removeBackAction(this.exitMenu);
    },

    scan: function() {
        var self = this;

        this.model.hideQuanMenu();

        bridge.qrcode.scan(function(res) {
            var code = res.code;

            if (code) {
                var m = code.match(/cmccfj\:\/\/user\/(\d+)/);
                if (m && m[1]) {
                    var user_id = parseInt(m[1]);
                    contact.isFriend(user_id).then(function(res) {
                        if (res.data)
                            self.forward('/contact/friend/' + user_id);
                        else
                            self.forward('/contact/person/' + user_id);
                    });

                } else if (code.indexOf('http://') == 0 || code.indexOf('https://') == 0) {
                    bridge.openInApp(code);
                }
            }

        });
    },

    loadPublicQuan: function(isShowLoading) {

        var loader = this.loader;
        var model = this.model;
        var self = this;

        isShowLoading && loader.showLoading();

        if (!this.quanSlider) {
            this.quanSlider = true;
            var self = this;

            news.getQuanBanner().then(function(res) {
                self.quanSlider = new Slider({
                    loop: true,
                    container: self.model.refs.quanBanner,
                    autoLoop: 3000,
                    data: util.map(res.data, ['image', 'linkurl']) || [],
                    dots: true,
                    itemTemplate: '<a href="javascript:;" data-url="<%=linkurl%>"><img src="<%=sl.resource(image)%>" /></a>'
                });
                self.model.next(function() {
                    self.quanSlider.adjustWidth();
                })
            });
        }

        Promise.all([publicquan.recommend(), publicquan.myfollow()])
            .then(function(results) {
                results.forEach(function(res, i) {

                    res.data.forEach(function(item) {

                        if (item.pub_quan_msg) {
                            var imgs;

                            if (item.pub_quan_msg.imgs) {
                                imgs = item.pub_quan_msg.imgs.split(',')
                            }

                            if ((!imgs || !imgs.length) && /<img\s+/.test(item.pub_quan_msg.content)) {
                                imgs = [];

                                item.pub_quan_msg.content.replace(/<img\s[^>]*?src=\"([^\"\>]+)\"/g, function(m, src) {
                                    imgs.push(src);
                                });
                            }

                            if (imgs && imgs.length > 3) {
                                imgs.length = 3;
                            }
                            item.pub_quan_msg.imgs = imgs;
                        }
                    });

                    model.set(i == 0 ? "recommendPubQuan" : "myfollowPublicQuan", res.data);
                });
            })
            .catch(function(e) {

                if (e.message == '无权限') {
                    self.forward('/login');
                } else
                    Toast.showToast(e.message);
            })
            .then(function() {
                loader.hideLoading();
            });
    },

    initQuan: function(tab) {
        var self = this;
        var model = this.model;

        quan.on('sendComment', function(e, data) {

            var msg = model.getModel('quanData').find('msg_id', data.msg_id);

            var comments = msg.getModel('comments');

            data = $.extend(data, user.data);

            if (comments) {
                comments.add([data]);

            } else {
                comments.set([data]);
            }
        });

        quan.on('publish', function(e, data) {
            var quanData = model.getModel('quanData');

            quanData.unshift(data);
        });

        model.commentQuanMsg = function(msg_id, user_id, user_name) {
            self.forward('/quan/comment?msg_id=' + msg_id, user_name && user_id != user.data.user_id ? {
                user_id: user_id,
                user_name: user_name

            } : undefined);
        }

        model.blackQuanMsg = function(msg_id) {
            var quanData = model.getModel('quanData');

            quan.black(msg_id).then(function() {
                Toast.showToast('屏蔽成功');

                quanData.remove('msg_id', msg_id);

            }).catch(function(e) {
                Toast.showToast(e.message);
            });
        };

        model.likeQuanMsg = function(msg_id) {
            var msg = model.getModel('quanData').find('msg_id', msg_id);
            var likes = msg.getModel('quan_likes');

            if (likes && likes.find('user_id', user.data.user_id)) {
                Toast.showToast('你已点赞！');
                return;
            }

            quan.like(msg_id).then(function() {

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

            }).catch(function(e) {
                Toast.showToast(e.message);
            });
        }

        self.quanLoader = quan.createLoader({
            model: model,
            attribute: 'quanData',
            scroll: tab.refs.items[1]
        });

        self.quanLoader.request();
    },

    loadContacts: function() {

    },

    initAllQuan: function() {
        var self = this;
        var model = this.model;

        if (model.get('tab') == 3 && !self.tab) {

            model.next(function() {

                var tab = self.tab = this.refs.tab;
                var records = {};
                var count = 1;
                records[0] = true;

                model.set({
                    quanTab: tab
                });
                self.loadPublicQuan(true);

                tab.onceTrue('tabChange', function(e, index) {

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


    onLoad: function() {

    },

    onShow: function() {
        var self = this;

        if (!auth.getAuthToken()) {
            self.forward('/login');

        } else {
            seajs.use(['logical/chat']);

            if (!self.loadShopUrl) {
                business.getThirdUrl().then(function(res) {
                    appconfig.set(res.data);
                    self.loadShopUrl = true;
                });
            }

            self.getYunmi();

            if (self.tab) {
                self.loadPublicQuan();
                self.quanLoader && self.quanLoader.reload();
            }
        }
    },

    onHide: function() {
        this.exitMenu();
    },

    onDestroy: function() {
        this.model.destroy();
    }
});