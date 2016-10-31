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

    events: {        'click .js_grid_delete': function(e) {
            if(window.confirm('确认删除吗?')) {
                Http.post('/login_history/delete',{ login_id: $(e.currentTarget).data('id') })            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: 'login_history管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/login_history/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    user_id: {
value: this.route.params.user_id,
type: "hidden",
label: ''
},
start_login_date: {
type:"calendar",
label: '登录时间 从'
},end_login_date: {
type:"calendar",
label: '到'
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "login_id",
                                    bind: "login_id",
width: 5
                                },{
                                    text: "用户ID",
                                    bind: "user_id",
width: 5
                                },{
                                    text: "登录时间",
                                    bind: "login_date",
format: util.formatDate,
width: 10
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" data-id="' + data.login_id + '" href="/login_history/update/' + data.login_id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.login_id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('login_historychange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});