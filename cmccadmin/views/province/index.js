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
                Http.post('/province/delete',{ province_id: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('provincechange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '省管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/province/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    province_name: {
label: '省名称'
},
country_id: {
options:{"url":"/country/getAll","text":"country_name","value":"country_id"},
type:"select",
label: '国家id'
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "省id",
                                    bind: "province_id",
width: 5
                                },{
                                    text: "省名称",
                                    bind: "province_name",
width: 10
                                },{
                                    text: "国家id",
                                    bind: "country_id",
width: 5
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/province/update/' + data.province_id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.province_id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('provincechange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});