var $ = require('$');
var util = require('util');
var model = require('core/model');
var Page = require('common/page');
var menu = require('common/menu');
var Form = require('components/form');
var newstypes = require('../data/newstypes');

return Page.extend({
    events: {},

    onCreate: function () {
        var self = this;

        this.model = new model.ViewModel(this.$el, {
            title: '修改活动页',
            buttons: [{
                value: '确认',
                click: function () {
                    form.submit(function (res) {
                        if (res.success) {
                            sl.tip('修改成功');
                            self.setResult('news_change');
                            self.back('/settings/news_list');
                            self.form.reset();

                        } else {
                            sl.tip(res.msg);
                        }
                    });
                }
            }]
        });

        self.model.set('data', $.extend(util.store('current_news'), { Name: this.route.data.name }));

        self.model.set('data.Sort', self.model.data.data.Sort + '');

        console.log(self.model.data.data)

        var form = new Form({
            model: this.model,
            name: 'data',
            title: 'test',
            useIframe: true,
            url: '/api/manage/modify_news',
            validator: 'userValid',
            enctype: '',
            fields: [{
                field: 'ID',
                type: 'hidden'
            }, {
                    label: '活动页类型',
                    field: 'Name',
                    type: 'select',
                    emptyAble: true,
                    options: {
                        data: newstypes
                    }
                }, {
                    label: '活动页标题',
                    field: 'Title',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '活动页详情',
                    field: 'Content',
                    vAlign: 'top',
                    type: 'richTextBox'
                }, {
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
