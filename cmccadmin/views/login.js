define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util'),
        Page = require('core/page'),
        model = require('core/model2'),
        Form = require('components/form');
    var Http = require('core/http');

    var Toast = require('widget/toast');
    var popup = require('widget/popup');
    var auth = require('logical/auth');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            this.model = new model.Model(this.$el, {
                title: '登录'
            });

            var form = new Form({
                url: '/admin/login',
                fields: [{
                    label: '账号',
                    field: 'admin_name',
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                    label: '密码',
                    field: 'tk',
                    type: 'password',
                    emptyAble: false,
                    emptyText: '不可为空'

                }],
                buttons: [{
                    value: '登录',
                    click: function () {
                        new Http({
                            url: '/admin/login',
                            params: auth.encryptParams({
                                admin_name: this.get('admin_name'),
                                password: auth.md5(this.get('tk'))
                            })
                        }).request()
                            .then(function (res) {
                                auth.setAdmin({
                                    adminId: res.data.adminId,
                                    adminName: res.data.adminName
                                });

                                auth.setAuthToken(res.data.tk);

                                self.forward("/");
                            });
                    }
                }]
            });

            form.$el.appendTo(this.$el);

        },

        onShow: function () {
        },

        onDestory: function () {
        }
    });
});

