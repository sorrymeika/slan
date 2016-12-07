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
        var business_id = this.route.params.id;
        var data = ({
            100022: {
                title: '推送娱乐提醒',
                feature: [],
                types: [{
                    text: '图文链接',
                    value: 1
                }]
            },
            100026: {
                title: '推送和聚宝提醒',
                feature: [{
                    label: "产品名称",
                    field: "product_name",
                    type: "text",
                    emptyAble: false,
                    emptyText: "不可为空"
                }, {
                    label: "募集期 从",
                    field: "start_date",
                    type: "timePicker",
                    emptyAble: false,
                    emptyText: "时间不可为空"
                }, {
                    label: "到",
                    field: "end_date",
                    type: "timePicker",
                    emptyAble: false,
                    emptyText: "时间不可为空"
                }, {
                    label: "期限（天）",
                    field: "days",
                    type: "number",
                    regex: /^\d+$/,
                    regexText: "格式错误",
                    emptyAble: false,
                    emptyText: "时间不可为空"
                }, {
                    label: "年化利率",
                    field: "rate",
                    type: "number",
                    emptyAble: false,
                    emptyText: "年化利率不可为空"
                }, {
                    label: "风险等级",
                    field: "risk",
                    type: "text",
                    emptyAble: false,
                    emptyText: "风险不可为空"
                }, {
                    label: "起息时间",
                    field: "interest_start_date",
                    type: "timePicker",
                    emptyAble: false,
                    emptyText: "时间不可为空"

                }, {
                    label: "结息时间",
                    field: "interest_end_date",
                    type: "timePicker",
                    emptyAble: false,
                    emptyText: "时间不可为空"
                }],
                types: [{
                    text: '理财产品',
                    value: 1
                }]
            }
        })[business_id];

        var model = this.model = new Model(this.$el, {
            title: data.title
        });

        var form = this.form = new Form({
            url: '/notification/add',
            fields: [{
                label: "用户手机号",
                field: "mobile",
                type: "text",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "用户手机号不可为空"
            }, {
                label: "关联流水id",
                field: "order_id",
                type: "text",
                emptyAble: false,
                emptyText: "关联流水id不可为空"
            }, {
                label: "提醒标题",
                field: "title",
                type: "text",
                emptyAble: false,
                emptyText: "提醒标题不可为空"
            }, {
                label: "提醒内容",
                field: "content",
                type: "text",
                emptyAble: false,
                emptyText: "提醒内容不可为空"
            }, {
                label: "跳转链接",
                field: "linkurl",
                type: "text"
            }, {
                label: "图片地址",
                field: "image",
                type: "text"
            }, {
                label: "类型",
                field: "type",
                type: "select",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "类型不可为空",
                options: data.types
            }, {
                label: "业务编号",
                field: "business_id",
                type: "hidden",
                value: business_id
            }, {
                label: "扩展字段",
                field: "feature",
                type: "hidden"

            }].concat(data.feature),

            buttons: [{
                value: '推送',
                click: function () {
                    var feature = {};

                    data.feature.forEach(function (item) {
                        feature[item.field] = form.get(item.field);
                    });

                    this.set({
                        feature: JSON.stringify(feature)
                    });

                    console.log(feature);

                    this.model.next(function () {
                        form.submit(function () {
                            Toast.showToast('添加成功');
                            form.reset();
                            history.back();
                            self.setResult('notificationchange');
                        }, function (e) {
                            Toast.showToast(e.message);
                        });
                    });
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
    onShow: function () { }
});