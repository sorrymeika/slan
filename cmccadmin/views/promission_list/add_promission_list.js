var $ = require('$');
var util = require('util');
var Model = require('core/model2').Model;
var Page = require('core/page');
var Http = require('core/http');

var Form = require('components/form');
var Grid = require('components/grid');

var Toast = require('widget/toast');
var popup = require('widget/popup')

module.exports = Page.extend({


    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '白名单添加'
        });

        var form = this.form = new Form({
            url: '/promission_list/add',
            fields: [{
                label: "账号",
                field: "account",
                type: "textarea",
                placeholder: '可填多个手机号，每个手机号换行隔开',
                emptyAble: false,
                emptyText: "账号不可为空"
            }, {
                field: "status",
                type: "hidden",
                value: 2
            }, {
                field: "type",
                type: "hidden",
                value: 1
            }],
            buttons: [{
                value: '添加',
                click: function () {
                    this.submit(function () {
                        Toast.showToast('添加成功');
                        form.reset().set({
                            status: 2,
                            type: 1
                        });
                        history.back();
                        self.setResult('promission_listchange');
                    }, function (e) { Toast.showToast(e.message); });
                }
            }, {
                value: '取消',
                click: function () {
                    history.back();
                }
            }]
        });
        form.$el.appendTo(model.refs.main);

    },
    onShow: function () {
    }
});