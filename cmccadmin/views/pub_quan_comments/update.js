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
            title: '公众圈文章评论修改'
        });

        var form = this.form = new Form({
            url: '/pub_quan_comments/update',
            fields: [{
                label: "评论编号",
                field: "comment_id",
                type: "hidden",
                value: this.route.params.id,
                emptyAble: false,
                emptyText: "评论编号不可为空"
            }, {
                label: "文章编号",
                field: "msg_id",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                value: this.route.params.quan_id,
                emptyAble: false,
                emptyText: "文章编号不可为空"
            }, {
                label: "评论时间",
                field: "add_date",
                type: "timePicker",
                emptyAble: false,
                emptyText: "评论时间不可为空"
            }, {
                label: "用户编号",
                field: "user_id",
                type: "hidden",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "用户编号不可为空"
            }, {
                label: "评论内容",
                field: "content",
                type: "textarea",
                emptyAble: false,
                emptyText: "评论内容不可为空"
            }],
            buttons: [{
                value: '修改',
                click: function () {
                    this.submit(function () {
                        Toast.showToast('修改');
                        self.setResult('pub_quan_commentschange');
                    }, function (e) { Toast.showToast(e.message); });
                }
            }, {
                value: '取消',
                click: function () {
                    history.back();
                }
            }]
        });
        Http.post('/pub_quan_comments/getById', {
            comment_id: this.route.params.id
        }).then(function (res) { form.set(res.data); });
        form.$el.appendTo(model.refs.main);

    },
    onShow: function () {
    }
});