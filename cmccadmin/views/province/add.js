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
            title: '省添加'
        });

var form = this.form = new Form({
                            url: '/province/add',
                            fields: [ {
                                    label: "省名称",
                                    field: "province_name",
                                    type:"text",
emptyAble:false,
                                        emptyText: "省名称不可为空"
}, {
                                    label: "国家id",
                                    field: "country_id",
                                    type:"select",
emptyAble:false,
                                        emptyText: "国家id不可为空"
,
options: {"url":"/country/getAll","text":"country_name","value":"country_id"}}],
                        buttons: [{
                            value:'添加',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('添加成功');
                                    form.reset();
                                    history.back();
                                    self.setResult('provincechange');
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