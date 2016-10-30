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
            title: '公众圈修改'
        });

var form = this.form = new Form({
                            url: '/pub_quan/update',
                            fields: [{
                                    label: "圈编号",
                                    field: "quan_id",
                                    type:"hidden",
                                    value: this.route.params.id}, {
                                    label: "圈名称",
                                    field: "quan_name",
                                    type:"text"}, {
                                    label: "圈图片",
                                    field: "quan_pic_file",
                                    type:"file"}, {
                                    label: "关注人数",
                                    field: "follow_num",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误"}, {
                                    label: "简介",
                                    field: "summary",
                                    type:"richTextBox"}, {
                                    label: "添加日期",
                                    field: "create_date",
                                    type:"timePicker"}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改');
                                    self.setResult('pub_quanchange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/pub_quan/getById',{
                            quan_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});