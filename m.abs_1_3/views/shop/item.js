
var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loader');
var Model = require('core/model2').Model;
var Scroll = require('widget/scroll');
var Share = require('components/share');
var Size = require('components/size');
var animation = require('animation');
var api = require('models/api');
var Slider = require('widget/slider');
var userModel = require('models/user');
var bridge = require('bridge');

module.exports = Activity.extend({
    events: {
        'tap .js_buy:not(.disabled)': function () {
            var self = this;

            if (self.model.data.colorSpec.length == 1) {
                if (self.user) {
                    this.size.confirm();

                } else {
                    self.forward('/login');
                }

            } else {
                this.size.show();
            }

        },
        'tap .js_share': function () {
            this.share.show();
        },
        'tap .js_select_size': function () {
            this.size.show();
        }
    },

    className: 'pd_item_bg',

    onCreate: function () {
        var self = this;

        self.user = userModel.get();

        var model = self.model = new Model(self.$el, {
            title: '床品',
            id: self.route.params.id,
            user: self.user,
            isLogin: !!self.user,
            url: encodeURIComponent(self.route.url),
            qty: 1,
            detailTip: '继续拖动',
            pullTip: '下拉'
        });

        var scroll = $(model.refs.scroll);
        var $main = $(model.refs.main);
        var $detail = $(model.refs.detail);
        var $detailScroll = $(model.refs.detailScroll);

        this.bindScrollTo($main);
        this.bindScrollTo($detail);

        var detail = new api.ProductDetailAPI({
            $el: self.$el,
            params: {
                id: self.route.params.id
            },
            success: function (res) {
                self.model.set({
                    detailHtml: res.data
                });
            }
        });

        self.listenTo($main, 'touchstart', function (e) {
            var main = e.currentTarget;
            this.isStart = false;
            this.startY = e.touches[0].pageY;
            this.isStop_iOS = util.ios && (main.scrollTop + main.clientHeight !== main.scrollHeight);

        }).listenTo($main, 'touchmove', function (e) {
            var main = e.currentTarget;
            var dY = e.touches[0].pageY - this.startY;

            if (dY < 0 && main.scrollTop + main.clientHeight >= main.scrollHeight) {

                if (!this.isStart) {
                    this.isStart = true;
                    this.startY = e.touches[0].pageY;
                    dY = 0;
                }

                if (!this.isStop_iOS) {

                    if (dY <= -70) {
                        model.set({
                            detailTip: '释放'
                        })

                    } else {
                        model.set({
                            detailTip: '继续拖动'
                        })
                    }

                    scroll.transform({
                        translate: '0px,' + (dY > 0 ? 0 : dY / 2) + 'px'
                    });

                    return false;
                }
            }
        }).listenTo($main, 'touchend', function (e) {
            if (self.isStart) {
                var dY = e.changedTouches[0].pageY - this.startY;

                if (dY <= -70) {
                    scroll.transform({
                        translate: '0px,0px'
                    });

                    $main.animate({
                        translate: '0px,-100%'

                    }, 'ease-out', 400)

                    $detail.animate({
                        translate: '0px,0'

                    }, 'ease-out', 400);

                    model.set({
                        isShowDetail: true,
                        detailTip: '继续拖动'
                    });

                    if (!this.loadedDetail) {
                        this.loadedDetail = true;
                        detail.load();
                    }

                } else {
                    scroll.animate({
                        translate: '0px,0px'

                    }, 'ease-out', 400);
                }
            }
        });

        self.listenTo($detail, 'touchstart', function (e) {
            this.isStart = false;
            this.startY = e.touches[0].pageY;
            this.isStop_iOS = util.ios && (e.currentTarget.scrollTop != 0);

        }).listenTo($detail, 'touchmove', function (e) {
            var main = e.currentTarget;
            var dY = e.touches[0].pageY - this.startY;

            if (dY > 0 && main.scrollTop <= 0) {

                if (!this.isStart) {
                    this.isStart = true;
                    this.startY = e.touches[0].pageY;
                    dY = 0;
                }

                if (!this.isStop_iOS) {
                    if (dY >= 70) {
                        model.set({
                            pullTip: '释放'
                        })

                    } else {

                        model.set({
                            pullTip: '下拉'
                        })
                    }

                    $detailScroll.transform({
                        translate: '0px,' + (dY < 0 ? 0 : dY / 2) + 'px'
                    })

                    return false;
                }

            }
        }).listenTo($detail, 'touchend', function (e) {
            if (self.isStart) {
                var dY = e.changedTouches[0].pageY - this.startY;

                if (dY >= 70) {
                    $detailScroll.transform({
                        translate: '0px,0px'
                    });

                    $detail.animate({
                        translate: '0px,100%'

                    }, 'ease-out', 400)

                    $main.animate({
                        translate: '0px,0px'

                    }, 'ease-out', 400);

                    model.set({
                        isShowDetail: false,
                        pullTip: '下拉'
                    })

                } else {
                    $detailScroll.animate({
                        translate: '0px,0px'

                    }, 'ease-out', 400);
                }
            }
        });

        self.onResult("Login", function () {
            self.user = userModel.get();

            self.model.set({
                isLogin: true,
                user: userModel.get()
            })
        });

        self.size = new Size();

        self.size.$el.appendTo(self.$el);

        self.size.on('SizeChange', function (e, item) {

            var data = {
                PRD_NUM: item.PRD_NUM
            }

            item.WPP_LIST_PIC && (data.WPP_LIST_PIC = item.WPP_LIST_PIC);

            self.model.set({
                data: data
            })
        });

        var product = new api.ProductAPI({
            $el: self.$el,
            params: {
                id: self.route.params.id
            },
            checkData: false,
            success: function (res) {
                console.log(res.data);
                res.data.PSV_QTY = res.psvqty;
                self.model.set({
                    full_amount: res.full_amount,
                    data: res.data
                });

                self.size.set({
                    qty: 1,
                    data: res.data
                });

                if (!res.prhpic) {
                    res.prhpic = [];
                }
                res.prhpic.unshift({
                    PHP_PIC_M: res.data.WPP_M_PIC
                });

                self.slider = new Slider({
                    container: self.model.refs.image,
                    loop: true,
                    autoLoop: 3000,
                    data: res.prhpic,
                    dots: res.prhpic.length >= 1,
                    itemTemplate: '<img width="100%" height="100%" src="<%=PHP_PIC_M%>" />'
                });

                self.share = new Share({
                    head: '分享商品至',
                    title: res.data.PRD_NAME,
                    linkURL: !res.data.FLASH_FLAG ? 'http://m.abs.cn/single/' + res.data.PRD_ID + '.html' : res.flpurl,
                    description: res.data.PRD_NAME,
                    image: "http://www.absimg.com/media/H5/app/logo.jpg"
                });
                self.share.$el.appendTo(self.$el);

                console.log(self.share);

                colorAndSpec.setParam({
                    id: res.data.PRD_PRH_ID
                }).load();
            },
            error: function (res) {
                sl.tip(res.msg || res.data || res.message);

                self.back(self.query.from || self.referrer);
            }
        });

        var colorAndSpec = new api.ProductColorAndSpec({
            $el: self.$el,
            checkData: false,
            success: function (res) {
                var color = [];
                var spec = [];
                for (var i = 0, len = res.data.length; i < len; i++) {
                    var item = res.data[i];
                    if (color.indexOf(item.PRD_COLOR) == -1) {
                        color.push(item.PRD_COLOR);
                    }
                    if (spec.indexOf(item.PRD_SPEC) == -1) {
                        spec.push(item.PRD_SPEC);
                    }
                }
                console.log(res);
                self.model.set({
                    color: color,
                    spec: spec,
                    colorSpec: res.data
                });

                self.size.set({
                    color: color,
                    spec: spec,
                    colorSpec: res.data
                });
            }
        });

        var packageRelativeAPI = new api.PackageRelativeAPI({
            $el: self.$el,
            params: {
                prdId: this.route.params.id
            },
            checkData: false,
            success: function (res) {
                console.log(res);
                self.model.set({
                    Package: res.data
                })
            }
        });

        this.waitLoad().then(function () {
            product.load();
            packageRelativeAPI.load();
        });
    },

    onShow: function () {
        var self = this;
        self.user = userModel.get();

        self.model.set({
            back: self.swipeRightBackAction
        });

        bridge.statusBar('dark');

    },

    onPause: function () {
        bridge.statusBar("light");
    }
});
