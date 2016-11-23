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

    onCreate: function() {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '公众圈推荐添加'
        });

        var grid = this.grid = new Grid({
            pageEnabled: true,
            search: {
                url: '/pub_quan/getPage',
                type: 'POST',
                beforeSend: function() {},
                data: {
                    quan_name: {
                        label: '圈名称'
                    },
                    start_create_date: {
                        label: '添加日期 从',
                        type: "calendar"
                    },
                    end_create_date: {
                        label: '到',
                        type: "calendar"
                    }
                }
            },
            onSelectRow: function(e, row) {

                console.log(row.data);

                form.set({
                    quan_id: row.data.quan_id
                })

            },
            columns: [{
                text: "圈编号",
                bind: "quan_id",
                width: 5
            }, {
                text: "圈名称",
                bind: "quan_name",
                width: 10
            }, {
                text: "关注人数",
                bind: "follow_num",
                width: 5
            }, {
                text: "添加日期",
                bind: "create_date",
                format: util.formatDate,
                width: 10
            }, {
                text: "操作",
                width: 10,
                align: 'center',
                valign: 'center',
                render: function(data) {
                    this.append($('<a class="js_click" data-id="' + data.quan_id + '" href="javascript:;">[选择]</a>'));
                }
            }]
        });
        this.onResult('pub_quanchange', function() {
            grid.search();
        });
        grid.$el.appendTo($(model.refs.main));
        grid.search();

        $(model.refs.main).append('<div class="ml_m mt_m cl_c00">请先在上方列表中选择圈子再添加</div>')

        var form = this.form = new Form({
            url: '/pub_quan_recommend/add',
            fields: [{
                label: "公众圈ID",
                field: "quan_id",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "请先在上方列表中选择圈子再添加"
            }, {
                label: "排序",
                field: "sort",
                type: "number",
                regex: /^\d+$/,
                regexText: "格式错误",
                emptyAble: false,
                emptyText: "排序不可为空",
                value: 0
            }],
            buttons: [{
                value: '添加',
                click: function() {
                    this.submit(function() {
                        Toast.showToast('添加成功');
                        form.reset();
                        history.back();
                        self.setResult('pub_quan_recommendchange');
                    }, function(e) {
                        Toast.showToast(e.message);
                    });
                }
            }, {
                value: '取消',
                click: function() {
                    history.back();
                }
            }]
        });
        form.$el.appendTo(model.refs.main);

    },
    onShow: function() {}
});