
var $ = require('$');
var util = require('util');
var Model = require('core/model2').Model;
var Page = require('core/page');
var Http = require('core/http');
var Form = require('components/form');
var Grid = require('components/grid');

var Toast = require('widget/toast');
var popup = require('widget/popup');

return Page.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: 'title'
        });

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

        form.$el.appendTo(model.ref.main);

    },

    onShow: function () {
    }
});
