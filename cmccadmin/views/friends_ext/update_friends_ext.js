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
            title: 'friends_ext修改'
        });

var form = this.form = new Form({
                            url: '/friends_ext/update',
                            fields: [{
                                    label: "自增id",
                                    field: "ext_id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "自增id不可为空"
}, {
                                    label: "好友id",
                                    field: "friend_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "好友id不可为空"
}, {
                                    label: "用户ID",
                                    field: "user_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "用户ID不可为空"
}, {
                                    label: "备注",
                                    field: "memo",
                                    type:"text",
emptyAble:false,
                                        emptyText: "备注不可为空"
}, {
                                    label: "允许留言",
                                    field: "enable_leave_msg",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "允许留言不可为空"
}, {
                                    label: "允许推送到首页",
                                    field: "enable_push",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "允许推送到首页不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改成功');
                                    history.back();
                                    self.setResult('friends_extchange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/friends_ext/getById',{
                            ext_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});