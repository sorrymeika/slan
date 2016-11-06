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
                Http.post('/city/delete',{ city_id: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('citychange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '市管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/city/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    city_name: {
label: '市名称'
},
country_id: {
options:{"url":"/country/getAll","text":"country_name","value":"country_id"},
type:"select",
label: '国家id'
},
province_id: {
options:{"url":"/province/filter","params":{"country_id":"country_id"},"text":"province_name","value":"province_id"},
type:"select",
label: '省id'
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "市id",
                                    bind: "city_id",
width: 5
                                },{
                                    text: "市名称",
                                    bind: "city_name",
width: 10
                                },{
                                    text: "省id",
                                    bind: "province_id",
width: 5
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/city/update/' + data.city_id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.city_id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('citychange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});