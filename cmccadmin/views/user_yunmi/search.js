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
            title: '导入数据查询'
        });
        var grid = this.grid = new Grid({
            search: {
                url: '/user_yunmi/getUserYunmiByMobile',
                type: 'POST',
                beforeSend: function (params) {
                    if (!params.mobile) {
                        Toast.showToast('请输入手机号后查询');
                        return false;
                    }
                },
                data: {
                    mobile: {
                        label: '用户手机'
                    }
                }
            },
            onSelectRow: function () { },
            columns: [{
                text: "时段ID",
                bind: "yunmi_id",
                width: 5
            }, {
                text: "用户ID",
                bind: "user_id",
                width: 5
            }, {
                text: "用户手机",
                bind: "account",
                width: 10
            }, {
                text: "云米数量",
                bind: "amount",
                width: 5
            }, {
                text: "时段开始时间",
                bind: "start_date",
                format: util.formatDate,
                width: 10
            }, {
                text: "时段结束时间",
                bind: "end_date",
                format: util.formatDate,
                width: 10
            }, {
                text: "云米生成时间",
                bind: "create_date",
                format: util.formatDate,
                width: 10
            }, {
                text: "状态",
                bind: "status",
                width: 5
            }, {
                text: "云米导入时间",
                bind: "add_date",
                format: util.formatDate,
                width: 10
            }]
        });

        grid.$el.appendTo($(model.refs.main));

    },
    onShow: function () {
    }
});