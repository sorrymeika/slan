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
            title: '公众圈添加'
        });

        var form = this.form = new Form({
            url: '/pub_quan/add',
            fields: [{
                label: "圈名称",
                field: "quan_name",
                type: "text",
                emptyAble: false,
                emptyText: "圈名称不可为空"
            }, {
                label: "圈图片",
                field: "quan_pic_file",
                type: "file",
                emptyAble: false,
                emptyText: "圈图片不可为空"
            }, {
                label: "关注人数",
                field: "follow_num",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "关注人数不可为空"
            }, {
                label: "简介",
                field: "summary",
                type: "richTextBox",
                emptyAble: false,
                emptyText: "简介不可为空"
            }, {
                label: "添加日期",
                field: "create_date",
                type: "timePicker",
                emptyAble: false,
                emptyText: "添加日期不可为空",
                value: Date.now()
            }],
            buttons: [{
                value: '添加',
                click: function () {
                    this.submit(function () {
                        Toast.showToast('添加成功');
                        form.reset();
                        self.setResult('pub_quanchange');
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