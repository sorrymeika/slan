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
            title: '新闻分类修改'
        });

var form = this.form = new Form({
                            url: '/news_category/update',
                            fields: [{
                                    label: "分类ID",
                                    field: "category_id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "分类ID不可为空"
}, {
                                    label: "分类名称",
                                    field: "category_name",
                                    type:"text",
emptyAble:false,
                                        emptyText: "分类名称不可为空"
}, {
                                    label: "类型",
                                    field: "type",
                                    type:"select",
options: [{"value":"1","text":"新闻"},{"value":"2","text":"关于我们"},{"value":"3","text":"广告位"}],
emptyAble:false,
                                        emptyText: "类型不可为空"
}, {
                                    label: "默认配置类型",
                                    field: "def_news_type",
                                    type:"select",
options: [{"value":"1","text":"文章"},{"value":"2","text":"图文链接"}],
emptyAble:false,
                                        emptyText: "默认配置类型不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改成功');
                                    history.back();
                                    self.setResult('news_categorychange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/news_category/getById',{
                            category_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});