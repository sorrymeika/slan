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
                Http.post('/user_yunmi/delete',{ yunmi_id: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('user_yunmichange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '云米时段管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/user_yunmi/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    start_start_date: {
type:"calendar",
label: '时段开始时间 从'
},end_start_date: {
type:"calendar",
label: '到'
},
start_end_date: {
type:"calendar",
label: '时段结束时间 从'
},end_end_date: {
type:"calendar",
label: '到'
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "时段ID",
                                    bind: "yunmi_id",
width: 5
                                },{
                                    text: "用户ID",
                                    bind: "user_id",
width: 5
                                },{
                                    text: "云米数量",
                                    bind: "amount",
width: 5
                                },{
                                    text: "时段开始时间",
                                    bind: "start_date",
format: util.formatDate,
width: 10
                                },{
                                    text: "时段结束时间",
                                    bind: "end_date",
format: util.formatDate,
width: 10
                                },{
                                    text: "云米生成时间",
                                    bind: "create_date",
format: util.formatDate,
width: 10
                                },{
                                    text: "状态",
                                    bind: "status",
width: 5
                                },{
                                    text: "云米导入时间",
                                    bind: "add_date",
format: util.formatDate,
width: 10
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/user_yunmi/update/' + data.yunmi_id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.yunmi_id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('user_yunmichange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});