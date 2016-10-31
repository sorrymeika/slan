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
            title: '用户添加'
        });

var form = this.form = new Form({
                            url: '/userinfo/add',
                            fields: [ {
                                    label: "用户头像",
                                    field: "avatars_file",
                                    type:"file",
emptyAble:false,
                                        emptyText: "用户头像不可为空"
}, {
                                    label: "用户昵称",
                                    field: "user_name",
                                    type:"text",
emptyAble:false,
                                        emptyText: "用户昵称不可为空"
}, {
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
                            value:'添加',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('添加成功');
                                    form.reset();
                                    self.setResult('userinfochange');
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