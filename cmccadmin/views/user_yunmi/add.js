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
            title: '云米时段添加'
        });

        var form = this.form = new Form({
            url: '/user_yunmi/add',
            fields: [{
                label: "用户ID",
                field: "user_id",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "用户ID不可为空"
            }, {
                label: "云米数量",
                field: "amount",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "云米数量不可为空"
            }, {
                label: "时段开始时间",
                field: "start_date",
                type: "timePicker",
                emptyAble: false,
                emptyText: "时段开始时间不可为空"
            }, {
                label: "时段结束时间",
                field: "end_date",
                type: "timePicker",
                emptyAble: false,
                emptyText: "时段结束时间不可为空"
            }, {
                label: "状态",
                field: "status",
                type: "select",
                emptyAble: false,
                emptyText: "状态不可为空"
                ,
                options: [{ "value": "1", "text": "已领取" }, { "value": "2", "text": "未领取" }, { "value": "3", "text": "已过期" }]
            }],
            buttons: [{
                value: '添加',
                click: function () {
                    this.submit(function () {
                        Toast.showToast('添加成功');
                        form.reset();
                        history.back();
                        self.setResult('user_yunmichange');
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