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
                Http.post('/pub_quan/delete',{ quan_id: $(e.currentTarget).data('id') })            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '公众圈管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/pub_quan/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    quan_name: {
label: '圈名称'
},
start_create_date: {
label: '添加日期 从',
type:"calendar"
},end_create_date: {
label: '到',
type:"calendar"
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "圈编号",
                                    bind: "quan_id",
width: 5
                                },{
                                    text: "圈名称",
                                    bind: "quan_name",
width: 10
                                },{
                                    text: "关注人数",
                                    bind: "follow_num",
width: 5
                                },{
                                    text: "添加日期",
                                    bind: "create_date",
format: util.formatDate,
width: 10
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" data-id="' + data.quan_id + '" href="/pub_quan/update/' + data.quan_id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.quan_id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('pub_quanchange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});