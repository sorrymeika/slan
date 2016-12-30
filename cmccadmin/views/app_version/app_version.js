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
                Http.post('/app_version/delete',{ version: $(e.currentTarget).data('id') }).then(function(){
                    self.setResult('app_versionchange');
                });            }
        }
    },

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: 'app版本管理'
        });
var grid = this.grid = new Grid({
                            pageEnabled: true,
                            search: {
                                url: '/app_version/getPage',
                                type: 'POST',
                                beforeSend: function () {
                                },
                                data: {
                                                                    }
                            },
                            onSelectRow: function () {},
                            columns: [{
                                    text: "版本号",
                                    bind: "version",
width: 10
                                },{
                                    text: "iOS版本id",
                                    bind: "ios_version",
width: 5
                                },{
                                    text: "ios下载地址",
                                    bind: "ios_url",
width: 10
                                },{
                                    text: "android版本id",
                                    bind: "android_version",
width: 5
                                },{
                                    text: "版本信息",
                                    bind: "content",
width: 10
                                }, {
                                text: "操作",
                                width: 10,
                                align: 'center',
                                valign: 'center',
                                render: function (data) {
                                    this.append($('<a class="js_click" href="/app_version/update/' + data.version + '">[修改]</a>'));
                                    this.append(' <a href="javascript:;" data-id="' + data.version + '" class="js_grid_delete">[删除]</a>');                                }                            }]                        });
                        this.onResult('app_versionchange', function() { grid.search(); });
                        grid.$el.appendTo($(model.refs.main));
grid.search();

},
    onShow: function () {
    }
});