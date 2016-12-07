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
            title: '公众圈文章添加'
        });

        var form = this.form = new Form({
            url: '/pub_quan_msg/add',
            fields: [{
                label: "标题",
                field: "title",
                type: "text",
                emptyAble: false,
                emptyText: "标题不可为空"
            }, {
                label: "文章内容",
                field: "content",
                type: "richTextBox",
                emptyAble: false,
                emptyText: "文章内容不可为空"
            }, {
                label: "圈编号",
                field: "quan_id",
                type: "hidden",
                regex: /^\d+$/,
                regexText: "格式错误",
                value: this.route.params.quan_id,
                emptyAble: false,
                emptyText: "圈编号不可为空"
            }, {
                label: "用户编号",
                field: "user_id",
                type: "hidden",
                value: "0",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "用户编号不可为空"
            }, {
                label: "添加时间",
                field: "add_date",
                type: "timePicker",
                value: Date.now(),
                emptyAble: false,
                emptyText: "添加时间不可为空"
            }, {
                label: "浏览数",
                field: "see",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "浏览数不可为空"
            }, {
                label: "喜欢数",
                field: "likes",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "喜欢数不可为空"
            }, {
                label: "评论数",
                field: "comments",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "评论数不可为空"
            }],
            buttons: [{
                value: '添加',
                click: function () {
                    this.submit(function () {
                        Toast.showToast('添加成功');
                        form.reset().set({
                            add_date: Date.now(),
                            quan_id: self.route.params.quan_id,
                            user_id: 0
                        });
                        self.setResult('pub_quan_msgchange');
                    }, function (e) { Toast.showToast(e.message); });
                }
            }, {
                value: '取消',
                click: function () {

                    location.hash = '/pub_quan_msg/index/' + (self.route.params.quan_id || 0);
                }
            }]
        });
        form.$el.appendTo(model.refs.main);

    },
    onShow: function () {
    }
});