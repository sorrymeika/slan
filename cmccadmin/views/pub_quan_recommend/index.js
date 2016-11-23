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
                Http.post('/pub_quan_recommend/delete', {
                    recommend_id: $(e.currentTarget).data('id')
                }).then(function() {
                    self.setResult('pub_quan_recommendchange');
                });
            }
        }
    },

    onCreate: function() {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '公众圈推荐管理'
        });
        var grid = this.grid = new Grid({
            pageEnabled: false,
            search: {
                url: '/pub_quan_recommend/getAll',
                type: 'POST',
                beforeSend: function() {},
                data: {}
            },
            onSelectRow: function() {},
            columns: [{
                text: "编号",
                bind: "recommend_id",
                width: 5
            }, {
                text: "公众圈ID",
                bind: "quan_id",
                width: 5
            }, {
                text: "公众圈名称",
                bind: "quan_name",
                width: 10
            }, {
                text: "推荐时间",
                bind: "recommend_date",
                format: util.formatDate,
                width: 10
            }, {
                text: "排序",
                bind: "sort",
                width: 5
            }, {
                text: "操作",
                width: 10,
                align: 'center',
                valign: 'center',
                render: function(data) {
                    this.append(' <a href="javascript:;" data-id="' + data.recommend_id + '" class="js_grid_delete">[删除]</a>');
                }
            }]
        });
        this.onResult('pub_quan_recommendchange', function() {
            grid.search();
        });
        grid.$el.appendTo($(model.refs.main));
        grid.search();

    },
    onShow: function() {}
});