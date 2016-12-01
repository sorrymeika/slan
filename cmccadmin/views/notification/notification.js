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

    events: {
        'click .js_grid_delete': function(e) {
            if (window.confirm('确认删除吗?')) {
                var self = this;
                Http.post('/notification/delete', {
                    notify_id: $(e.currentTarget).data('id')
                }).then(function() {
                    self.setResult('notificationchange');
                });
            }
        }
    },

    onCreate: function() {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '消息提醒管理'
        });
        var grid = this.grid = new Grid({
            pageEnabled: true,
            search: {
                url: '/notification/getPage',
                type: 'POST',
                beforeSend: function() {},
                data: {
                    start_send_date: {
                        type: "calendar",
                        label: '发送日期 从'
                    },
                    end_send_date: {
                        type: "calendar",
                        label: '到'
                    }
                }
            },
            onSelectRow: function() {},
            columns: [{
                text: "自增ID",
                bind: "notify_id",
                width: 5
            }, {
                text: "提醒标题",
                bind: "title",
                width: 10
            }, {
                text: "关联流水id",
                bind: "order_id",
                width: 10
            }, {
                text: "提醒内容",
                bind: "content",
                width: 10
            }, {
                text: "跳转链接",
                bind: "linkurl",
                width: 10
            }, {
                text: "用户ID",
                bind: "user_id",
                width: 5
            }, {
                text: "图片",
                bind: "image",
                width: 10
            }, {
                text: "类型",
                bind: "type",
                width: 5
            }, {
                text: "业务编号",
                bind: "business_id",
                width: 5
            }, {
                text: "发送日期",
                bind: "send_date",
                format: util.formatDate,
                width: 10
            }, {
                text: "操作",
                width: 10,
                align: 'center',
                valign: 'center',
                render: function(data) {
                    this.append($('<a class="js_click" href="/notification/update/' + data.notify_id + '">[修改]</a>'));
                    this.append(' <a href="javascript:;" data-id="' + data.notify_id + '" class="js_grid_delete">[删除]</a>');
                }
            }]
        });
        this.onResult('notificationchange', function() {
            grid.search();
        });
        grid.$el.appendTo($(model.refs.main));
        grid.search();

    },
    onShow: function() {}
});