var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/api');
var Category = require("models/category");
var CpCategory = require("components/category");

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {

        },

        'focus .js_search': function (e) {
            e.currentTarget.setAttribute('placeholder', '');
        },

        'blur .js_search': function (e) {
            e.currentTarget.setAttribute('placeholder', '热门搜索：新月枕');
        }
    },

    onCreate: function () {
        var self = this;

        self.swipeRightBackAction = self.route.query.from || '/';

        var $main = this.$('.main');

        Scroll.bind($main);

        self.productSearchAPI = new api.ProductSearchAPI({
            $el: self.$el,
            $scroll: $main,
            $content: $main,
            check: false,
            beforeSend: function () {
                this.setUrl('/Prod/productlist')
                    .setParam({
                        orderbyStr: "PRD_ONLINE_DT",
                        orderby: "desc",
                        keycodes: ''
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


        this.listenTo(this.$('.js_search'), 'keydown', function (e) {
            if (e.keyCode == 13) {
                self.forward('/list?s=' + e.target.value + '&from=/all');
                e.preventDefault();
                return false;
            }
        });


        this.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            resource: 'http://appuser.abs.cn'
        });

        this.model.selectCate = function (e, item) {
            if (typeof item == 'string' && !/^\d+$/.test(item)) {
                self.forward(item);
                return;
            }

            typeof item !== 'object' && (item = util.first(this.data.categories, function (cate) {
                return cate.PCG_ID == item;
            }));

            this.set({
                current: item,
                id: item.PCG_ID,
                currentSub: item.children[0]
            });

            this.refs.cates.scroll.scrollTo((item.PCG_ID - 1) * $(this.refs.cates).find(".curr").width(), 0, 200);

            self.cpCategory.set({
                current: item.PCG_ID
            });

            this.requestProd(e, item.PCG_ID);
        }

        this.model.showCategories = function () {
            self.cpCategory.show();
        }

        this.model.selectSubCate = function (e, item) {
            this.set("currentSub", item);
            this.requestProd(e, item.PCG_ID);
        }

        this.model.requestProd = function (e, id) {

            this.set("currentSearchId", id);

            self.productSearchAPI.setParam({
                pcgid: id

            }).reload();
        }

        Scroll.bind(this.model.refs.cates, {
            useScroll: true,
            vScroll: false,
            hScroll: true
        });

        console.profile('cate')
        console.time('cate')

        Category.list(function (res, navs) {

            console.log('navs', navs)
            console.log('categories', res)

            var cpCategory = new CpCategory({
                data: res,
                goto: function (e, id) {

                    self.model.selectCate(null, id);

                    cpCategory.hide();
                }
            });

            cpCategory.$el.appendTo('body');

            self.cpCategory = cpCategory;

            self.setCategories(res, navs);
        });

        console.profileEnd()
        console.timeEnd('cate')

    },

    onStart: function (params) {
        var self = this;

    },

    setCategories: function (categories, navs) {
        var self = this;
        this.categories = model.State.data.categories;

        var id = self.route.query.id || 1;
        var current = util.first(categories, function (item) {
            return item.PCG_ID == id;
        });
        var currentSub = current.children[0];

        this.model.set({
            id: id,
            categories: categories,
            navs: navs,
            current: current,
            currentSub: currentSub
        });

        self.model.selectCate(null, current);
    },

    onQueryChange: function (e) {
        if ('id' in e.data) {
            this.model.selectCate(null, this.query.id);
        }
    },

    onEnter: function () {
        var self = this;

    },

    onDestory: function () {
    }
});
