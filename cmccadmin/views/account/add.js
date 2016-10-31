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
            title: 'account添加'
        });

var form = this.form = new Form({
                            url: '/account/add',
                            fields: [ {
                                    label: "用户账号",
                                    field: "account",
                                    type:"text",
emptyAble:false,
                                        emptyText: "用户账号不可为空"
}, {
                                    label: "用户密码",
                                    field: "password",
                                    type:"text",
emptyAble:false,
                                        emptyText: "用户密码不可为空"
}, {
                                    label: "注册时间",
                                    field: "register_date",
                                    type:"timePicker",
emptyAble:false,
                                        emptyText: "注册时间不可为空"
}],
                        buttons: [{
                            value:'添加',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('添加成功');
                                    form.reset();
                                    self.setResult('accountchange');
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