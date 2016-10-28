
var $ = require('$');
var util = require('util');
var Model = require('core/model2').Model;
var Page = require('core/page');
var Http = require('core/http');
var Form = require('components/form');
var Grid = require('components/grid');

var razor = require('razor');
var auth = require('logical/auth');

return Page.extend({
    events: {},

    onCreate: function () {
        var self = this;

        this.model = new Model(this.$el, {});
        /*

                new Http({
                    url: '/admin/login',
                    params: auth.encryptParams({
                        admin_name: "admin",
                        password: auth.md5('123456')
                    })
        
                }).request().then(function (res) {
                    auth.setAdmin({
                        adminId: res.data.adminId,
                        adminName: res.data.adminName
                    });
        
                    auth.setAuthToken(res.data.tk);
                });
                */

        Http.post('/admin/test').then(function () {

        })


        var form = new Form({
            url: '',
            fields: [{
                label: '文本框',
                field: 'code',
                type: "textarea",
                value: localStorage.getItem('code')
            }],
            buttons: [{
                value: 'asdf',
                click: function () {
                    var code = this.data().code.replace(/\/\/.*?\n/g, '');
                    var result;

                    localStorage.setItem('code', code);

                    result = code.replace(/(?:\s*)private\s+([a-zA-Z]+)\s+([^\;]+);(?:\s*)/g, function (match, type, v) {

                        console.log(match, type, v);

                        return 'public ' + type + " get" + v.replace(/^[a-z]/g, function (a) {
                            return a.toUpperCase();

                        }) + "(){ return " + v + "; }\n";
                    });

                    result += code.replace(/(?:\s*)private\s+([a-zA-Z]+)\s+([^\;]+)\;(\s*)/mg, function (match, type, v) {

                        console.log(match, type, v);

                        return 'public void set' + v.replace(/^[a-z]/g, function (a) {

                            return a.toUpperCase();

                        }) + "(" + type + " " + v + "){ this." + v + " = " + v + "; }\n";
                    });

                    this.set({
                        code: result
                    })
                    console.log(result);
                }
            }]
        });
        form.$el.appendTo(this.$el);


        var form = new Form({
            url: '',
            
            fields: [{
                label: '时间选择',
                field: 'time',
                type: "TimePicker"
            }, {
                label: '文本框',
                field: 'name',
                type: "text",
                value: "aaa",
                emptyAble: false
            }, {
                label: '文本框',
                field: 'xxx',
                type: "textarea",
                value: "aaa"
            }, {
                label: '下拉框',
                field: 'categoryId',
                type: 'select',
                value: 1,
                options: [{
                    text: '选项1',
                    value: 1
                }]
            }]
        });

        form.$el.appendTo(this.$el);
    },

    onShow: function () {
    }
});
