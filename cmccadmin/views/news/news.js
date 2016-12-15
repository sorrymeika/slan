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
        'click .js_grid_delete': function (e) {
            if (window.confirm('确认删除吗?')) {
                var self = this;
                Http.post('/news/delete', { news_id: $(e.currentTarget).data('id') }).then(function () {
                    self.setResult('newschange');
                });
            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '新闻管理'
        });
        var grid = this.grid = new Grid({
            pageEnabled: true,
            search: {
                url: '/news/getPage',
                type: 'POST',
                beforeSend: function () {
                },
                data: {
                    title: {
                        label: '新闻标题'
                    },
                    type: {
                        options: [{ "value": '', "text": "选择类型" }, { "value": "1", "text": "新闻" }, { "value": "2", "text": "关于我们" }, { "value": "3", "text": "广告位" }],
                        type: "select",
                        label: '分类类型'
                    },
                    category_id: {
                        options: {
                            "url": "/news_category/filter", "params": { "type": "type" }, "text": "category_name", "value": "category_id"
                        },
                        type: "select",
                        label: '分类'
                    }
                }
            },
            onSelectRow: function () { },
            columns: [{
                text: "自增ID",
                bind: "news_id",
                width: 5
            }, {
                text: "新闻标题",
                bind: "title",
                width: 10
            }, {
                text: "新闻摘要",
                bind: "summary",
                width: 10
            }, {
                text: "跳转链接",
                bind: "linkurl",
                width: 10
            }, {
                text: "图片",
                bind: "image",
                width: 10
            }, {
                text: "分类",
                bind: "category_id",
                width: 5
            }, {
                text: "配置类型",
                bind: "news_type",
                width: 5
            }, {
                text: "发布日期",
                bind: "add_date",
                format: util.formatDate,
                width: 10
            }, {
                text: "操作",
                width: 10,
                align: 'center',
                valign: 'center',
                render: function (data) {
                    this.append($('<a class="js_click" href="/news/update/' + data.news_id + '">[修改]</a>'));
                    this.append(' <a href="javascript:;" data-id="' + data.news_id + '" class="js_grid_delete">[删除]</a>');
                }
            }]
        });
        this.onResult('newschange', function () { grid.search(); });
        grid.$el.appendTo($(model.refs.main));
        grid.search();

    },
    onShow: function () {
    }
});