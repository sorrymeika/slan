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
            title: '省修改'
        });

var form = this.form = new Form({
                            url: '/province/update',
                            fields: [{
                                    label: "省id",
                                    field: "province_id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "省id不可为空"
}, {
                                    label: "省名称",
                                    field: "province_name",
                                    type:"text",
emptyAble:false,
                                        emptyText: "省名称不可为空"
}, {
                                    label: "国家id",
                                    field: "country_id",
                                    type:"select",
options: {"url":"/country/getAll","text":"country_name","value":"country_id"},
emptyAble:false,
                                        emptyText: "国家id不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改成功');
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
                        Http.post('/province/getById',{
                            province_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});