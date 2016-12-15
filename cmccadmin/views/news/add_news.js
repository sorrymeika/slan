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
            title: '新闻添加'
        });

        var form = this.form = new Form({
            url: '/news/add',
            fields: [{
                label: "新闻标题",
                field: "title",
                type: "text",
                emptyAble: false,
                emptyText: "新闻标题不可为空"
            }, {
                label: "新闻摘要",
                field: "summary",
                type: "textarea"
            }, {
                label: "分类",
                field: "category_id",
                type: "select",
                emptyAble: false,
                emptyText: "分类不可为空",
                options: { "url": "/news_category/getAll", "text": "category_name", "value": "category_id" }
            }, {
                label: "配置类型",
                field: "news_type",
                type: "select",
                emptyText: "配置类型不可为空",
                options: [{ "value": "1", "text": "文章" }, { "value": "2", "text": "图文链接" }],
                value: 1
            }, {
                label: "跳转链接",
                field: "linkurl",
                type: "text",
                emptyText: "不可为空"
            }, {
                label: "图片",
                field: "image_file",
                type: "file",
                emptyText: "图片不可为空"
            }, {
                label: "文章内容",
                field: "content",
                type: "richTextBox",
                emptyAble: false,
                emptyText: "文章内容不可为空"
            }, {
                label: "发布日期",
                field: "add_date",
                type: "timePicker",
                emptyAble: false,
                emptyText: "发布日期不可为空",
                value: Date.now()
            }],
            buttons: [{
                value: '添加',
                click: function () {
                    this.submit(function () {
                        Toast.showToast('添加成功');
                        form.reset();
                        history.back();
                        self.setResult('newschange');
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

        form.model.on('change:data.news_type', function (e, val) {
            switch (parseInt(val)) {
                case 1:
                    form.setFields('linkurl.emptyAble', true)
                        .setFields('image_file.emptyAble', true)
                        .setFields('content.visible', true);
                    break;
                case 2:
                    form.setFields('linkurl.emptyAble', false)
                        .setFields('image_file.emptyAble', false)
                        .setFields('content.visible', false);
                    break;
            }
        });

        form.set('news_type', 2);

    },
    onShow: function () {
    }
});