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
            title: '公众圈文章修改'
        });

        var form = this.form = new Form({
            url: '/pub_quan_msg/update',
            fields: [{
                label: "文章编号",
                field: "msg_id",
                type: "hidden",
                value: this.route.params.id
            }, {
                label: "标题",
                field: "title",
                type: "text"
            }, {
                label: "文章内容",
                field: "content",
                type: "richTextBox"
            }, {
                label: "圈编号",
                field: "quan_id",
                type: "hidden",
                regex: /^\d+$/,
                regexText: "格式错误",
                value: this.route.params.quan_id
            }, {
                label: "用户编号",
                field: "user_id",
                type: "hidden",
                regex: /^\d+$/,
                regexText: "格式错误"
            }, {
                label: "添加时间",
                field: "add_date",
                type: "timePicker"
            }, {
                label: "浏览数",
                field: "see",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误"
            }, {
                label: "喜欢数",
                field: "likes",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误"
            }, {
                label: "评论数",
                field: "comments",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误"
            }],
            buttons: [{
                value: '修改',
                click: function () {
                    this.submit(function () {
                        Toast.showToast('修改');
                        self.setResult('pub_quan_msgchange');
                    }, function (e) { Toast.showToast(e.message); });
                }
            }, {
                value: '取消',
                click: function () {
                    history.back();
                }
            }]
        });
        Http.post('/pub_quan_msg/getById', {
            msg_id: this.route.params.id
        }).then(function (res) { form.set(res.data); });
        form.$el.appendTo(model.refs.main);

    },
    onShow: function () {
    }
});