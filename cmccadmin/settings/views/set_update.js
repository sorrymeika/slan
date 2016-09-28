define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('common/page');
    var menu = require('common/menu');
    var Form = require('components/form');
    var adtypes = require('../data/adtypes');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: 'app版本管理',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('修改成功');
                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    }
                }]
            });

            var form = new Form({
                model: this.model,
                name: 'data',
                useIframe: true,
                url: '/api/manage/set_update',
                validator: 'updateValid',
                enctype: '',
                fields: [{
                    label: '版本号',
                    field: 'Version',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: 'IOS下载链接',
                    field: 'IOSUrl',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: 'apk下载链接',
                    field: 'AndroidUrl',
                    emptyAble: false,
                    emptyText: '必填'
                }, {
                    label: '更新内容',
                    field: 'Content',
                    vAlign: 'top',
                    type: 'richTextBox'
                }]
            });

            this.model.before('.action', form.$el);

            $.get('/api/settings/get_update', function (res) {
                if (res.success) {
                    self.model.set('data', res.data);
                }
            }, "json");
        },

        onShow: function () {
            this.menu = menu.get(this.route.path);
            this.$el.before(this.menu.$el);
        },

        onDestory: function () {
        }
    });
});
