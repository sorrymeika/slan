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
                Http.post('/quan_comments/delete',{ comment_id: $(e.currentTarget).data('id') })            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '朋友圈评论管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/quan_comments/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    msg_id: {
value: this.route.params.msg_id,
type: "hidden",
label: ''
},
start_add_date: {
type:"calendar",
label: '评论时间 从'
},end_add_date: {
type:"calendar",
label: '到'
},
user_id: {
label: '用户编号'
},
at_user_id: {
label: '用户编号'
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "评论编号",
                                    bind: "comment_id",
width: 5
                                },{
                                    text: "圈消息编号",
                                    bind: "msg_id",
width: 5
                                },{
                                    text: "评论时间",
                                    bind: "add_date",
format: util.formatDate,
width: 10
                                },{
                                    text: "用户编号",
                                    bind: "user_id",
width: 5
                                },{
                                    text: "用户编号",
                                    bind: "at_user_id",
width: 5
                                },{
                                    text: "评论内容",
                                    bind: "content",
width: 10
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/quan_comments/update/' + data.comment_id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.comment_id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('quan_commentschange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});