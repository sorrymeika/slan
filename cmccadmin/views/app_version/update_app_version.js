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
            title: 'app版本修改'
        });

        var form = this.form = new Form({
            url: '/app_version/update',
            fields: [{
                label: "版本号",
                field: "version",
                type: "text",
                value: this.route.params.version,
                emptyAble: false,
                emptyText: "版本号不可为空"
            }, {
                label: "iOS版本id",
                field: "ios_version",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "iOS版本id不可为空"
            }, {
                label: "ios下载地址",
                field: "ios_url",
                type: "text",
                emptyAble: false,
                emptyText: "ios下载地址不可为空"
            }, {
                label: "android版本id",
                field: "android_version",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "android版本id不可为空"
            }, {
                label: "android下载地址",
                field: "android_url_file",
                type: "file"
            }, {
                label: "版本描述",
                field: "content",
                type: "textarea",
                emptyAble: false,
                emptyText: "版本描述不可为空"
            }],
            buttons: [{
                value: '修改',
                click: function () {
                    this.submit(function () {
                        Toast.showToast('修改成功');
                        history.back();
                        self.setResult('app_versionchange');
                    }, function (e) { Toast.showToast(e.message); });
                }
            }, {
                value: '取消',
                click: function () {
                    history.back();
                }
            }]
        });
        Http.post('/app_version/getById', {
            version: this.route.params.version
        }).then(function (res) { form.set(res.data); });
        form.$el.appendTo(model.refs.main);

    },
    onShow: function () {
    }
});