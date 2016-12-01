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
            title: '消息提醒添加'
        });

var form = this.form = new Form({
                            url: '/notification/add',
                            fields: [{
                                    label: "用户ID",
                                    field: "user_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "用户ID不可为空"
},  {
                                    label: "关联流水id",
                                    field: "order_id",
                                    type:"text",
emptyAble:false,
                                        emptyText: "关联流水id不可为空"
}, {
                                    label: "提醒内容",
                                    field: "content",
                                    type:"text",
emptyAble:false,
                                        emptyText: "提醒内容不可为空"
}, {
                                    label: "跳转链接",
                                    field: "linkurl",
                                    type:"text",
emptyAble:false,
                                        emptyText: "跳转链接不可为空"
}, {
                                    label: "提醒标题",
                                    field: "title",
                                    type:"text",
emptyAble:false,
                                        emptyText: "提醒标题不可为空"
}, {
                                    label: "图片",
                                    field: "image",
                                    type:"text",
emptyAble:false,
                                        emptyText: "图片不可为空"
}, {
                                    label: "类型",
                                    field: "type",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "类型不可为空"
}, {
                                    label: "业务编号",
                                    field: "business_id",
                                    type:"select",
emptyAble:false,
                                        emptyText: "业务编号不可为空"
,
options: {"url":"/business/getAll","text":"business_name","value":"business_id"}}, {
                                    label: "扩展字段",
                                    field: "feature",
                                    type:"text",
emptyAble:false,
                                        emptyText: "扩展字段不可为空"
}, {
                                    label: "发送日期",
                                    field: "send_date",
                                    type:"timePicker",
emptyAble:false,
                                        emptyText: "发送日期不可为空"
}],
                        buttons: [{
                            value:'添加',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('添加成功');
                                    form.reset();
                                    history.back();
                                    self.setResult('notificationchange');
                                },function(e){ Toast.showToast(e.message); });
                                }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});