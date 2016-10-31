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
            title: 'login_history添加'
        });

var form = this.form = new Form({
                            url: '/login_history/add',
                            fields: [ {
                                    label: "用户ID",
                                    field: "user_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
value: this.route.params.user_id,
emptyAble:false,
                                        emptyText: "用户ID不可为空"
}, {
                                    label: "登录时间",
                                    field: "login_date",
                                    type:"timePicker",
emptyAble:false,
                                        emptyText: "登录时间不可为空"
}],
                        buttons: [{
                            value:'添加',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('添加成功');
                                    form.reset();
                                    self.setResult('login_historychange');
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