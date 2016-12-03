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
                Http.post('/friends_ext/delete',{ ext_id: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('friends_extchange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: 'friends_ext管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/friends_ext/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                                                    }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "自增id",
                                    bind: "ext_id",
width: 5
                                },{
                                    text: "好友id",
                                    bind: "friend_id",
width: 5
                                },{
                                    text: "用户ID",
                                    bind: "user_id",
width: 5
                                },{
                                    text: "备注",
                                    bind: "memo",
width: 10
                                },{
                                    text: "允许留言",
                                    bind: "enable_leave_msg",
width: 5
                                },{
                                    text: "允许推送到首页",
                                    bind: "enable_push",
width: 5
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/friends_ext/update/' + data.ext_id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.ext_id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('friends_extchange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});