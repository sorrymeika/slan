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
            title: '朋友圈赞修改'
        });

var form = this.form = new Form({
                            url: '/quan_likes/update',
                            fields: [{
                                    label: "评论编号",
                                    field: "like_id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "评论编号不可为空"
}, {
                                    label: "圈消息编号",
                                    field: "msg_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
value: this.route.params.msg_id,
emptyAble:false,
                                        emptyText: "圈消息编号不可为空"
}, {
                                    label: "评论时间",
                                    field: "add_date",
                                    type:"timePicker",
emptyAble:false,
                                        emptyText: "评论时间不可为空"
}, {
                                    label: "用户编号",
                                    field: "user_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "用户编号不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改');
                                    self.setResult('quan_likeschange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/quan_likes/getById',{
                            like_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});