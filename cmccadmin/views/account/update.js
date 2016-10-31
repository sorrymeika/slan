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
            title: 'account修改'
        });

var form = this.form = new Form({
                            url: '/account/update',
                            fields: [{
                                    label: "用户ID",
                                    field: "user_id",
                                    type:"hidden",
                                    value: this.route.params.id}, {
                                    label: "用户账号",
                                    field: "account",
                                    type:"text"}, {
                                    label: "用户密码",
                                    field: "password",
                                    type:"text"}, {
                                    label: "注册时间",
                                    field: "register_date",
                                    type:"timePicker"}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改');
                                    self.setResult('accountchange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/account/getById',{
                            user_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});