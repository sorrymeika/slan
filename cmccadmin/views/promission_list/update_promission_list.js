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
            title: '黑白名单修改'
        });

var form = this.form = new Form({
                            url: '/promission_list/update',
                            fields: [{
                                    label: "ID",
                                    field: "promission_id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "ID不可为空"
}, {
                                    label: "账号",
                                    field: "account",
                                    type:"text",
emptyAble:false,
                                        emptyText: "账号不可为空"
}, {
                                    label: "状态",
                                    field: "status",
                                    type:"select",
options: [{"value":"1","text":"黑名单"},{"value":"2","text":"白名单"}],
emptyAble:false,
                                        emptyText: "状态不可为空"
}, {
                                    label: "类型",
                                    field: "type",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
options: {"1":"完全匹配","2":"正则匹配"},
emptyAble:false,
                                        emptyText: "类型不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改成功');
                                    history.back();
                                    self.setResult('promission_listchange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/promission_list/getById',{
                            promission_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});