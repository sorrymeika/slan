define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model2');
    var Scroll = require('widget/scroll');
    var Share = require('components/share');
    var Size = require('components/size');
    var animation = require('animation');
    var api = require('models/base');
    var Slider = require('widget/slider');

    return Activity.extend({
        events: {
            'tap .js_buy:not(.disabled)': function () {
                var self = this;
                this.size.show();
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
            var $main = self.$('.main');

            self.swipeRightBackAction = self.route.query.from || self.route.referrer || self.defBackUrl;

            Scroll.bind($main);

            self.user = util.store('user');

            self.model = new model.ViewModel(self.$el, {
                back: self.swipeRightBackAction,
                title: '床品',
                id: self.route.data.id,
                user: self.user,
                url: encodeURIComponent(self.route.url),
                qty: 1
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
                    id: self.route.data.id
                },
                checkData: false,
                success: function (res) {
                    console.log(res.data);
                    res.data.PSV_QTY = res.psvqty;
                    self.model.set({
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

                    self.slider = new Slider(self.model.refs.image, {
                        loop: true,
                        autoLoop: 3000,
                        data: res.prhpic,
                        dots: res.prhpic.length >= 1,
                        itemTemplate: '<img width="100%" height="100%" src="<%=PHP_PIC_M%>" />'
                    });

                    self.share = new Share({
                        head: '分享商品至',
                        title: res.data.PRD_NAME,
                        linkURL: 'http://m.abs.cn/single/' + res.data.PRD_ID + '.html',
                        description: res.data.PRD_NAME,
                        image: "http://www.absimg.com/media/H5/app/logo.jpg"
                    });
                    self.share.$el.appendTo(self.$el);

                    colorAndSpec.setParam({
                        id: res.data.PRD_PRH_ID
                    }).load();
                }
            });
            product.load();

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
                    prdId: this.route.data.id
                },
                checkData: false,
                success: function (res) {
                    console.log(res);
                    self.model.set({
                        Package: res.data
                    })
                }
            });

            packageRelativeAPI.load();
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
