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
                Http.post('/country/delete',{ country_id: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('countrychange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '国家管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/country/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    country_name: {
label: '国家名称'
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "国家id",
                                    bind: "country_id",
width: 5
                                },{
                                    text: "国家名称",
                                    bind: "country_name",
width: 10
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/country/update/' + data.country_id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.country_id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('countrychange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});