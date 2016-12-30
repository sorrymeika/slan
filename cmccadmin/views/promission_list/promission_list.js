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
                Http.post('/promission_list/delete', { promission_id: $(e.currentTarget).data('id') }).then(function () {
                    self.setResult('promission_listchange');
                });
            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '白名单管理'
        });
        var grid = this.grid = new Grid({
            pageEnabled: true,
            search: {
                url: '/promission_list/getPage',
                type: 'POST',
                beforeSend: function () {
                },
                data: {
                    status: 2,
                    type: 1,
                    account: {
                        label: '账号',
                        type: 'text'
                    }
                }
            },
            onSelectRow: function () { },
            columns: [{
                text: "ID",
                bind: "promission_id",
                width: 5
            }, {
                text: "账号",
                bind: "account",
                width: 10
            }, {
                text: "操作",
                width: 10,
                align: 'center',
                valign: 'center',
                render: function (data) {
                    this.append(' <a href="javascript:;" data-id="' + data.promission_id + '" class="js_grid_delete">[删除]</a>');
                }
            }]
        });
        this.onResult('promission_listchange', function () { grid.search(); });
        grid.$el.appendTo($(model.refs.main));
        grid.search();

    },
    onShow: function () {
    }
});