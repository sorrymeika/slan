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
                Http.post('/video_live_category/delete',{ id: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('video_live_categorychange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '直播分类管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/video_live_category/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                                                    }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "自增ID",
                                    bind: "id",
width: 5
                                },{
                                    text: "频道分类名称",
                                    bind: "name",
width: 10
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/video_live_category/update/' + data.id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('video_live_categorychange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});