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
                Http.post('/userinfo/delete', { user_id: $(e.currentTarget).data('id') })
            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '用户管理'
        });
        var grid = this.grid = new Grid({
            pageEnabled: true,
            search: {
                url: '/userinfo/getPage',
                type: 'POST',
                beforeSend: function () {
                },
                data: {
                    user_name: {
                        label: '用户昵称'
                    },
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
                text: "用户昵称",
                bind: "user_name",
                width: 10
            }, {
                text: "用户账号",
                bind: "account",
                width: 10
            }, {
                text: "注册时间",
                bind: "register_date",
                format: util.formatDate,
                width: 10
            }, {
                text: "签名",
                bind: "sign_text",
                width: 10
            }, {
                text: "性别",
                bind: "gender",
                width: 5
            }, {
                text: "email",
                bind: "email",
                width: 10
            }, {
                text: "星座",
                bind: "constellation",
                width: 5
            }, {
                text: "操作",
                width: 10,
                align: 'center',
                valign: 'center',
                render: function (data) {
                    this.append($('<a class="js_click" data-id="' + data.user_id + '" href="/userinfo/update/' + data.user_id + '">[修改]</a>'));
                    this.append($('<a class="js_click" data-id="' + data.user_id + '" href="/login_history/index/' + data.user_id + '">[登录历史]</a>'));
                    //this.append(' <a href="javascript:;" data-id="' + data.user_id + '" class="js_grid_delete">[删除]</a>');
                }
            }]
        });
        this.onResult('userinfochange', function () { grid.search(); });
        grid.$el.appendTo($(model.refs.main));
        grid.search();

    },
    onShow: function () {
    }
});