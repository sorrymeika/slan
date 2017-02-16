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

    
    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '直播修改'
        });

var form = this.form = new Form({
                            url: '/video_live/update',
                            fields: [{
                                    label: "自增ID",
                                    field: "id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "自增ID不可为空"
}, {
                                    label: "频道名称",
                                    field: "name",
                                    type:"text",
emptyAble:false,
                                        emptyText: "频道名称不可为空"
}, {
                                    label: "图片",
                                    field: "image_file",
                                    type:"file"}, {
                                    label: "播放地址",
                                    field: "url",
                                    type:"text",
emptyAble:false,
                                        emptyText: "播放地址不可为空"
}, {
                                    label: "分类",
                                    field: "category_id",
                                    type:"select",
options: {"url":"/video_live_category/getAll","params":{},"text":"name","value":"id"},
emptyAble:false,
                                        emptyText: "分类不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改成功');
                                    history.back();
                                    self.setResult('video_livechange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/video_live/getById',{
                            id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});