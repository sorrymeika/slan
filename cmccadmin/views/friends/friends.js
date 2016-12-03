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
var self = this;
                Http.post('/friends/delete',{ fid: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('friendschange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '好友管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/friends/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    start_add_date: {
type:"calendar",
label: '添加时间 从'
},end_add_date: {
type:"calendar",
label: '到'
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "自增id",
                                    bind: "fid",
width: 5
                                },{
                                    text: "好友id",
                                    bind: "friend_id",
width: 5
                                },{
                                    text: "发起请求方",
                                    bind: "user_id",
width: 5
                                },{
                                    text: "状态",
                                    bind: "status",
width: 5
                                },{
                                    text: "添加时间",
                                    bind: "add_date",
format: util.formatDate,
width: 10
                                },{
                                    text: "验证消息",
                                    bind: "msg",
width: 10
                                },{
                                    text: "显示在新好友中",
                                    bind: "show",
width: 5
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/friends/update/' + data.fid + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.fid + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('friendschange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});