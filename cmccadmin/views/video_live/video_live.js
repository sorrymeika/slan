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
                Http.post('/video_live/delete',{ id: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('video_livechange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '直播管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/video_live/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                    category_id: {
options:{"url":"/video_live_category/getAll","params":{},"text":"name","value":"id"},
type:"select",
label: '分类'
}                                }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "自增ID",
                                    bind: "id",
width: 5
                                },{
                                    text: "频道名称",
                                    bind: "name",
width: 10
                                },{
                                    text: "播放地址",
                                    bind: "url",
width: 10
                                },{
                                    text: "分类",
                                    bind: "category_id",
width: 5
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/video_live/update/' + data.id + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.id + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('video_livechange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});