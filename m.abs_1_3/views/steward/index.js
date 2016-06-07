var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/base');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function() {

        }
    },
    swipeRightBackAction: '/',

    onCreate: function() {
        var self = this;

        var $main = this.$('.main');

        self.user = util.store('user');

        Scroll.bind($main);

        var cates = [{
            id: 1,
            name: '出行'
        }, {
                id: 2,
                name: '睡眠'
            }, {
                id: 3,
                name: '美食'
            }, {
                id: 4,
                name: '沐浴'
            }, {
                id: 5,
                name: '休闲'
            }, {
                id: 6,
                name: '家务'
            }, {
                id: 7,
                name: '空间'
            }, {
                id: 8,
                name: '儿童'
            }];

        this.model = new model.ViewModel(this.$el, {
            back: '/',
            title: '爱管家',
            displayType: 1,
            user: self.user
        });

        self.model.setCate = function(e, cate) {

            self.model.getModel('cates').each(function(item) {
                if (item.data.id == cate.id) {

                    if (util.indexOf(self.model.get('data'), function(prh) {
                        return prh.CAT_ID == cate.id;
                    }) != -1) {
                        item.set('currCate', !item.data.currCate);

                    } else {
                        sl.tip('没有记录哦');
                    }
                }
            });
        }

        var categories = util.store('categories');

        var cate = new api.CategoryAPI({
            success: function(res) {
                categories = res.data;
                util.store('categories', res.data);
                listAPI.load();

            },
            $el: self.$el
        });

        var filter = function(data) {

            data.forEach(function(item) {
                var pctId = item.PRH_PCT_ID;
                var cate;

                while (pctId) {
                    cate = util.first(categories, function(cateItem) {
                        return cateItem.PCG_ID == pctId;
                    });
                    pctId = cate ? cate.PCG_PARENT_ID : 0;
                }
                item.CAT_ID = cate ? cate.PCG_ID : 0;

                cate = util.first(cates, function(cateItem) {
                    return cateItem.id == item.CAT_ID;
                })

                cate && (cate.currCate = true);
            })
            self.model.set({
                cates: cates
            });
            return data;
        }

        var listAPI = new api.StewardListAPI({
            $el: self.$el,
            params: $.extend({
                pspcode: self.user.PSP_CODE,
                pageSize: 10,
                currentpage: 1

            }, self.user.token),

            $scroll: $main,
            $content: $main,

            checkData: false,

            success: function(res) {
                if (res.data.length >= 10) {
                    res.total = (this.pageIndex + 1) * parseInt(this.pageSize)
                }

                self.model.set({
                    data: filter(res.data)
                });
            },
            append: function(res) {
                if (res.data.length == 10)
                    res.total = (this.pageIndex + 1) * parseInt(this.pageSize);
                else if (!res.data.length) {
                    res.total = self.model.get('data').length;
                }

                self.model.getModel('data').add(res.data);
            }
        });

        if (categories) {
            listAPI.load();

        } else {
            cate.load();
        }
    },

    onShow: function() {
        var self = this;
    },

    onDestory: function() {
    }
});