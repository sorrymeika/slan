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
            title: '用户修改'
        });

var form = this.form = new Form({
                            url: '/userinfo/update',
                            fields: [{
                                    label: "用户ID",
                                    field: "user_id",
                                    type:"hidden",
                                    value: this.route.params.id}, {
                                    label: "用户头像",
                                    field: "avatars_file",
                                    type:"file"}, {
                                    label: "用户昵称",
                                    field: "user_name",
                                    type:"text"}, {
                                    label: "签名",
                                    field: "sign_text",
                                    type:"text"}, {
                                    label: "性别",
                                    field: "gender",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误"}, {
                                    label: "家乡城市",
                                    field: "home_city_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误"}, {
                                    label: "家乡区县",
                                    field: "home_region_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误"}, {
                                    label: "所在城市",
                                    field: "city_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误"}, {
                                    label: "所在区县",
                                    field: "region_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误"}, {
                                    label: "标签",
                                    field: "tag",
                                    type:"text"}, {
                                    label: "email",
                                    field: "email",
                                    type:"text"}, {
                                    label: "星座",
                                    field: "constellation",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误"}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改');
                                    self.setResult('userinfochange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/userinfo/getById',{
                            user_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});