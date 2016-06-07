define(function(require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model2');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var bridge = require('bridge');
    var api = require('models/base');
    var Share = require('components/share')

    var cardAnimation = function(items) {
        if (!items.length) return;

        var count = items.length;
        var index = count - 1;
        items.parent().css({ height: 100 * count });
        items.each(function(j, item) {
            item.style.zIndex = j;
        });
        setTimeout(function() {
            var next = arguments.callee;
            var item = items.eq(index);
            var msec;

            if (item.hasClass('show')) {
                msec = 0;
            } else {
                item[0].clientHeight;
                item.addClass('show');
                msec = 300;
            }

            setTimeout((function(i) {
                return function() {
                    item.animate({
                        opacity: 1,
                        translate: '0px,' + 100 * i + 'px'

                    }, i * 450, 'ease-out');

                    index--;
                    if (index >= 0) {
                        next();
                    }
                }

            })(index), msec);

        }, 200)
    };

    return Activity.extend({
        events: {
            'tap .coupon_tip': function() {
                util.store('showTipStep', 3);
                this.model.set({
                    showTipStep: 3
                })
            }
        },

        swipeRightBackAction: '/',

        onCreate: function() {
            var self = this;

            var $main = this.$('.main');

            Scroll.bind($main);

            self.user = util.store('user');

            this.model = new model.ViewModel(this.$el, {
                back: '/',
                title: '我的卡券',
                isOverdue: false,
                showTipStep: util.store('showTipStep')
            });

            this.model.goTo = function(e, item) {
                if (item.LVP_PRD_ID) {
                    self.forward("/item/" + item.LVP_PRD_ID + "?from=" + encodeURIComponent(self.route.url));
                }
            }

            this.model.couponApi = new api.CouponAPI({
                $el: this.$el,
                checkData: false,
                beforeSend: function() {
                    var code = self.model.get('code');

                    if (!code) {
                        sl.tip('请输入券号');
                        return false;
                    }
                    this.setParam({
                        csvcode: code
                    });
                },
                params: {
                    pspcode: self.user.PSP_CODE
                },
                success: function(res) {
                    if (res.success) {
                        sl.tip('领取成功');
                        self.loading.reload();

                    } else {
                        sl.tip(res.msg);
                    }
                },
                error: function(res) {
                    sl.tip(res.msg);
                }
            });

            this.couponStatusApi = new api.CouponStatusAPI({
                $el: this.$el,
                checkData: false,
                params: {
                    pspcode: self.user.PSP_CODE
                },
                success: function(res) {
                    console.log(res);
                },
                error: function(res) {
                    console.log(res);
                }
            });

            self.share = new Share({
                head: '分享这张优惠券'
            });
            self.share.callback = function(res) {
                if (!res.success) {
                    sl.tip(res.msg);
                } else {
                    sl.tip('分享成功');
                    self.share.hide();
                }
            }

            self.share.$el.appendTo(self.$el);

            this.model.share = function(e, item) {
                self.couponStatusApi.setParam({
                    id: item.CSV_ID,
                    UserID: self.user.ID,
                    Auth: self.user.Auth

                }).load(function(err, res) {
                    if (!err && res.success) {
                        if (res.overdue) {
                            return;
                        }
                        self.share.set({
                            linkURL: res.url,
                            title: 'ABS优惠券分享',
                            description: 'ABS优惠券分享'

                        }).show();
                    } else {
                        sl.tip(err && err.msg || res.msg);
                    }
                });

                e.stopPropagation();
            }

            self.loading = new Loading({
                url: "/api/user/voucher_list",
                params: {
                    status: 1
                },
                $el: this.$el,
                check: false,
                checkData: false,
                success: function(res) {
                    if (res.closeNumber) {
                        self.confirm("您有" + res.closeNumber + '张优惠券马上就要过期啦，<br>尽快使用哦', function() {
                        });
                    }

                    if (!res || !res.data || res.data.length == 0) {
                        self.model.set("data", []);
                        self.model.set("data1", []);
                    }
                    else {
                        var data = util.find(res.data, function(item) {
                            return item.VCA_VCT_ID != 4;
                        });

                        data.sort(function(a, b) {
                            return a.IsOverdue && !b.IsOverdue ? 1 : !a.IsOverdue && b.IsOverdue ? -1 : a.CSV_END_DT > b.CSV_END_DT ? 1 : a.CSV_END_DT == b.CSV_END_DT ? 0 : -1;
                        });
                        self.model.set("data", data);

                        var data1 = util.find(res.data, function(item) {
                            return item.VCA_VCT_ID == 4;
                        });
                        data1.sort(function(a, b) {
                            return a.IsOverdue && !b.IsOverdue ? 1 : !a.IsOverdue && b.IsOverdue ? -1 : a.CSV_END_DT > b.CSV_END_DT ? 1 : a.CSV_END_DT == b.CSV_END_DT ? 0 : -1;
                        });

                        self.model.set("data1", data1);

                        self.showItemsWithAnim();
                    }
                }
            });

            self.model.on('change:isOverdue', function() {
                if (self.model.data.isOverdue) {
                    self.showItemsWithAnim();
                }
            });

        },

        showItemsWithAnim: function() {
            var self = this;
            var $items = self.$(self.model.data.isOverdue ? '.js_overdue' : '.js_not_overdue').children('li');

            cardAnimation($items);
        },

        onShow: function() {
            var self = this;

            self.user = util.store('user');

            if (!self.user) {
                self.forward('/login?success=' + this.route.url + "&from=/");
            } else {
                self.loading.setParam({
                    UserID: self.user.ID,
                    Auth: self.user.Auth

                }).load();
            }
        },

        onDestory: function() {
        }
    });
});
