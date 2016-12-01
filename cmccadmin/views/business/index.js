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
                Http.post('/business/delete',{ business_id: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('businesschange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '第三方业务管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/business/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    type: {
options:{"1":"移动业务","2":"生活","3":"娱乐","4":"社交"},
label: '业务类型'
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "业务ID",
                                    bind: "business_id",
width: 5
                                },{
                                    text: "业务名称",
                                    bind: "business_name",
width: 10
                                },{
                                    text: "业务密码",
                                    bind: "secret_key",
width: 10
                                },{
                                    text: "业务类型",
                                    bind: "type",
width: 5
                                },{
                                    text: "跳转链接",
                                    bind: "linkurl",
width: 10
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/business/update/' + data.business_id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.business_id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('businesschange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});