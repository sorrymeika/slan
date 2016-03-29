define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('common/page');
    var menu = require('common/menu');
    var Form = require('components/form');
    var API = require('models/api').API;
    var adtypes = require('../data/adtypes');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: 'app资源管理',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('设置成功');

                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    }
                }]
            });

            var form = new Form({
                model: this.model,
                name: 'mapping',
                useIframe: true,
                url: API.url('/api/manage/set_resource_mapping'),
                validator: 'updateValid',
                enctype: '',
                fields: [{
                    label: 'Version',
                    field: 'Version',
                    value: '1.1.0',
                    type: 'select',
                    options: {
                        data: [{
                            text: '<1.1.0',
                            value: ''
                        }, {
                                text: '1.1.0',
                                value: '1.1.0'
                            }, {
                                text: '1.2.0',
                                value: '1.2.0'
                            }]
                    }
                }, {
                        label: 'Key',
                        field: 'Key',
                        emptyAble: false,
                        emptyText: '必填'
                    }, {
                        label: 'Value',
                        field: 'Value'
                    }]

            });

            this.model.before('.js_action', form.$el);


            form.$el.on('change', '[name="Version"]', function () {
                api.setParam({
                    v: self.model.data.mapping.Version

                }).request();
            });

            var form2 = new Form({
                model: this.model,
                name: 'upload',
                useIframe: true,
                url: API.url('/api/manage/upload_resource'),
                validator: 'updateValid',
                enctype: '',
                fields: [{
                    label: '资源文件',
                    field: 'file',
                    type: 'file'
                }]
            });

            this.model.before('.js_action1', form2.$el);

            this.model.set({
                buttons1: [{
                    click: function () {
                        form2.submit(function (res) {
                            if (res.success) {
                                sl.tip('上传成功');

                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    },
                    value: '上传'
                }]
            })

            var api = new API({
                url: '/api/settings/resourceMapping',
                params: {
                    v: ''
                },
                success: function (res) {
                    if (res.success) {
                        self.$('.js_data').html(JSON.stringify(res.data));
                    }
                }
            }).request();
        },

        onShow: function () {
            this.menu = menu.get(this.route.path);
            this.$el.before(this.menu.$el);
        },

        onDestory: function () {
        }
    });
});
