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
                Http.post('/account/delete', { user_id: $(e.currentTarget).data('id') })
            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: 'account管理'
        });
        var grid = this.grid = new Grid({
            pageEnabled: true,
            search: {
                url: '/account/getPage',
                type: 'POST',
                beforeSend: function () {
                },
                data: {
                    account: {
                        label: '用户账号'
                    },
                    start_register_date: {
                        label: '注册时间 从',
                        type: "calendar"
                    }, end_register_date: {
                        label: '到',
                        type: "calendar"
                    }
                }
            },
            onSelectRow: function () { },
            columns: [{
                text: "用户ID",
                bind: "user_id",
                width: 5
            }, {
                text: "用户账号",
                bind: "account",
                width: 10
            }, {
                text: "用户密码",
                bind: "password",
                width: 10
            }, {
                text: "注册时间",
                bind: "register_date",
                format: util.formatDate,
                width: 10
            }, {
                text: "操作",
                width: 10,
                align: 'center',
                valign: 'center',
                render: function (data) {
                    this.append($('<a class="js_click" data-id="' + data.user_id + '" href="/account/update/' + data.user_id + '">[修改]</a>'));
                    this.append(' <a href="javascript:;" data-id="' + data.user_id + '" class="js_grid_delete">[删除]</a>');
                }
            }]
        });
        this.onResult('accountchange', function () { grid.search(); });
        grid.$el.appendTo($(model.refs.main));
        grid.search();

    },
    onShow: function () {
    }
});