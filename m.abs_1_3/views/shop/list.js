define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var Activity = require('activity');
    var Loading = require('widget/loading');
    var model = require('core/model2');
    var Scroll = require('widget/scroll');
    var animation = require('animation');
    var api = require('models/base');

    return Activity.extend({
        events: {
            'tap .js_bind:not(.disabled)': function () {
            }
        },

        onCreate: function () {
            var self = this;
            var $main = self.$('.main');

            self.swipeRightBackAction = self.route.query.from || '/all';

            Scroll.bind($main);

            var categories = util.store('categories');

            var cate = categories ? util.first(categories, function (item) {
                return item.PCG_ID == self.route.query.id;
            }) : null;

            self.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                title: cate ? cate.PCG_NAME : '商品列表',
                orderBy: 'PRD_ONLINE_DT|desc',
                priceSort: true,
                url: encodeURIComponent(self.route.url)
            });

            self.model.orderBy = function (e, orderBy) {
                this.set('orderBy', orderBy);
                list.abort().reload();
            }

            var list = new api.ProductSearchAPI({
                $el: self.$el,
                $scroll: $main,
                $content: $main,
                check: false,
                beforeSend: function () {
                    var orderBy = self.model.get('orderBy');
                    orderBy = orderBy.split('|');

                    this.setUrl(self.route.query.type == "new" ? '/api/prod/newproductlist' : '/Prod/productlist')
                        .setParam({
                            orderbyStr: self.route.query.type == "new" && orderBy[0] == "PRD_MEMBER_PRICE" ? 'PRD_PRICE' : orderBy[0],
                            orderby: orderBy[1],
                            pcgid: self.route.query.id,
                            keycodes: self.route.query.s || ''
                        });
                },
                KEY_PAGE: 'pages',
                KEY_PAGESIZE: 'length',
                MSG_NO_MORE: '别拉了，就这些<i class="ico_no_more"></i>',
                pageSize: '10',
                success: function (res) {
                    if (res.data.length == 10) res.total = (this.pageIndex + 1) * parseInt(this.pageSize)

                    self.model.set({
                        data: res.data
                    });
                },
                append: function (res) {
                    if (res.data.length == 10) res.total = (this.pageIndex + 1) * parseInt(this.pageSize);

                    self.model.getModel('data').add(res.data);
                }
            });
            list.load();

        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
