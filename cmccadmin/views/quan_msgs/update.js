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
            title: '朋友圈修改'
        });

var form = this.form = new Form({
                            url: '/quan_msgs/update',
                            fields: [{
                                    label: "圈消息编号",
                                    field: "msg_id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "圈消息编号不可为空"
}, {
                                    label: "用户编号",
                                    field: "user_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "用户编号不可为空"
}, {
                                    label: "发布时间",
                                    field: "add_date",
                                    type:"timePicker",
emptyAble:false,
                                        emptyText: "发布时间不可为空"
}, {
                                    label: "发布内容",
                                    field: "content",
                                    type:"text",
emptyAble:false,
                                        emptyText: "发布内容不可为空"
}, {
                                    label: "图片",
                                    field: "imgs",
                                    type:"text",
emptyAble:false,
                                        emptyText: "图片不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改');
                                    self.setResult('quan_msgschange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/quan_msgs/getById',{
                            msg_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});