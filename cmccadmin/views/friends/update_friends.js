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
            title: '好友修改'
        });

var form = this.form = new Form({
                            url: '/friends/update',
                            fields: [{
                                    label: "自增id",
                                    field: "fid",
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
                                    label: "发起请求方",
                                    field: "user_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "发起请求方不可为空"
}, {
                                    label: "状态",
                                    field: "status",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
options: {"0":"拒绝","1":"接受","2":"删除","-2":"非好友","-1":"未处理","":""},
emptyAble:false,
                                        emptyText: "状态不可为空"
}, {
                                    label: "添加时间",
                                    field: "add_date",
                                    type:"timePicker",
emptyAble:false,
                                        emptyText: "添加时间不可为空"
}, {
                                    label: "验证消息",
                                    field: "msg",
                                    type:"text",
emptyAble:false,
                                        emptyText: "验证消息不可为空"
}, {
                                    label: "显示在新好友中",
                                    field: "show",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "显示在新好友中不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改成功');
                                    history.back();
                                    self.setResult('friendschange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/friends/getById',{
                            fid: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});