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
            title: '直播添加'
        });

var form = this.form = new Form({
                            url: '/video_live/add',
                            fields: [ {
                                    label: "频道名称",
                                    field: "name",
                                    type:"text",
emptyAble:false,
                                        emptyText: "频道名称不可为空"
}, {
                                    label: "图片",
                                    field: "image_file",
                                    type:"file",
emptyAble:false,
                                        emptyText: "图片不可为空"
}, {
                                    label: "播放地址",
                                    field: "url",
                                    type:"text",
emptyAble:false,
                                        emptyText: "播放地址不可为空"
}, {
                                    label: "分类",
                                    field: "category_id",
                                    type:"select",
emptyAble:false,
                                        emptyText: "分类不可为空"
,
options: {"url":"/video_live_category/getAll","params":{},"text":"name","value":"id"}}],
                        buttons: [{
                            value:'添加',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('添加成功');
                                    form.reset();
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
form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});