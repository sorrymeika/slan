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
                Http.post('/news_category/delete', { category_id: $(e.currentTarget).data('id') }).then(function () {
                    self.setResult('news_categorychange');
                });
            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '新闻分类管理'
        });
        var grid = this.grid = new Grid({
            pageEnabled: true,
            search: {
                url: '/news_category/getPage',
                type: 'POST',
                beforeSend: function () {
                },
                data: {
                    type: {
                        options: [{ "value": '', "text": "选择类型" }, { "value": "1", "text": "新闻" }, { "value": "2", "text": "关于我们" }, { "value": "3", "text": "广告位" }],
                        type: "select",
                        label: '类型'
                    }
                }
            },
            onSelectRow: function () { },
            columns: [{
                text: "分类ID",
                bind: "category_id",
                width: 5
            }, {
                text: "分类名称",
                bind: "category_name",
                width: 10
            }, {
                text: "类型",
                bind: "type",
                width: 5
            }, {
                text: "默认配置类型",
                bind: "def_news_type",
                width: 5
            }, {
                text: "操作",
                width: 10,
                align: 'center',
                valign: 'center',
                render: function (data) {
                    this.append($('<a class="js_click" href="/news_category/update/' + data.category_id + '">[修改]</a>'));
                    this.append(' <a href="javascript:;" data-id="' + data.category_id + '" class="js_grid_delete">[删除]</a>');
                }
            }]
        });
        this.onResult('news_categorychange', function () { grid.search(); });
        grid.$el.appendTo($(model.refs.main));
        grid.search();

    },
    onShow: function () {
    }
});