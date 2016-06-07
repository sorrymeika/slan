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

            this.listenTo(this.$('.js_search'), 'keydown', function (e) {
                if (e.keyCode == 13) {
                    self.forward('/list?s=' + e.target.value + '&from=/all');
                    e.preventDefault();
                    return false;
                }
            });


            this.model = new model.ViewModel(this.$el, {
                back: self.swipeRightBackAction,
                id: this.route.query.id||1,  
                resource: 'http://appuser.abs.cn'
            });

            this.model.subcates = function (item) {

                return util.find(self.categories, function (a) {
                    return a.PCG_PARENT_ID == item.PCG_ID;
                });
            }

            this.model.bindScroll = function () {
                Scroll.bind(self.$('.sp_all_list_wrap:not(.s_binded)').addClass('s_binded'), {
                    vScroll: false,
                    hScroll: true
                });
            }

            var categories = util.store('categories');
            categories && self.setCategories(categories);

            var cate = new api.CategoryAPI({
                success: function (res) {
                    util.store('categories', res.data);

                    self.setCategories(res.data);
                },
                $el: self.$el
            });
            cate.load();
        },

        setCategories: function (categories) {
            var self = this;
            this.categories = categories;

            var list = util.find(categories, function (item) {
                item.children = util.find(categories, function (sub) {
                    return sub.PCG_PARENT_ID == item.PCG_ID
                });
                return item.PCG_DEPTH == 1;
            });
            
            var id = self.route.query.id || 1;

            this.model.set({
                id: id,
                categories: list
            }).set({
                current: util.first(list, function (item) { 
                    return item.PCG_ID == id;
                }) 
            });
            console.log(list.length, self.model.data.categories.length)
            this.model.bindScroll();
        },

        onShow: function () {
            var self = this;
        },

        onDestory: function () {
        }
    });
});
