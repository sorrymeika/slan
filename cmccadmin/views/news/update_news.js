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
            title: '新闻修改'
        });

var form = this.form = new Form({
                            url: '/news/update',
                            fields: [{
                                    label: "自增ID",
                                    field: "news_id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "自增ID不可为空"
}, {
                                    label: "新闻标题",
                                    field: "title",
                                    type:"text",
emptyAble:false,
                                        emptyText: "新闻标题不可为空"
}, {
                                    label: "新闻摘要",
                                    field: "summary",
                                    type:"text",
emptyAble:false,
                                        emptyText: "新闻摘要不可为空"
}, {
                                    label: "跳转链接",
                                    field: "linkurl",
                                    type:"text",
emptyAble:false,
                                        emptyText: "跳转链接不可为空"
}, {
                                    label: "图片",
                                    field: "image",
                                    type:"text",
emptyAble:false,
                                        emptyText: "图片不可为空"
}, {
                                    label: "分类",
                                    field: "category_id",
                                    type:"select",
options: {"url":"/news_category/filter","params":{"type":"type"},"text":"category_name","value":"category_id"},
emptyAble:false,
                                        emptyText: "分类不可为空"
}, {
                                    label: "配置类型",
                                    field: "news_type",
                                    type:"select",
options: [{"value":"1","text":"文章"},{"value":"2","text":"图文链接"}],
emptyAble:false,
                                        emptyText: "配置类型不可为空"
}, {
                                    label: "文章内容",
                                    field: "content",
                                    type:"richTextBox",
emptyAble:false,
                                        emptyText: "文章内容不可为空"
}, {
                                    label: "发布日期",
                                    field: "add_date",
                                    type:"timePicker",
emptyAble:false,
                                        emptyText: "发布日期不可为空"
}, {
                                    label: "分类类型",
                                    field: "type",
                                    type:"select",
options: [{"value":"1","text":"新闻"},{"value":"2","text":"关于我们"},{"value":"3","text":"广告位"}],
emptyAble:false,
                                        emptyText: "分类类型不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改成功');
                                    history.back();
                                    self.setResult('newschange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/news/getById',{
                            news_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});