define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('common/page');
    var menu = require('common/menu');
    var Form = require('components/form');
    var adtypes = require('../data/adtypes');
    var API = require('models/api').API;

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '添加广告',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('添加成功');
                                self.setResult('ad_change');
                                self.back('/settings/ad_list');
                                form.reset();

                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    }
                }, {
                    value: '重置',
                    click: function () {
                        form.reset();
                    }
                }],
                user: {
                    Sort: '0'
                }
            });

            var form = new Form({
                model: this.model,
                name: 'user',
                title: 'test',
                useIframe: true,
                url: API.url('/api/manage/add_ad'),
                validator: 'userValid',
                enctype: '',
                fields: [{
                    label: '广告位置',
                    field: 'Name',
                    type: 'select',
                    emptyAble: true,
                    options: {
                        data: adtypes
                    }
                }, {
                    label: '广告标题',
                    field: 'Title',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '广告链接',
                    field: 'Url',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '广告图片',
                    field: 'Src',
                    type: 'file',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '广告详情',
                    field: 'Description',
                    vAlign: 'top',
                    type: 'richTextBox'
                }, {
                    label: '广告详情',
                    field: 'Sort',
                    type: 'number',
                    label: '排序'
                }]
            });

            this.model.before('.action', form.$el);
        },

        onShow: function () {
            this.menu = menu.get(this.route.path);
            this.$el.before(this.menu.$el);
        },

        onDestory: function () {
        }
    });
});
