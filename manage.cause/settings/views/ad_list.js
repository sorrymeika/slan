﻿define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('common/page');
    var menu = require('common/menu');
    var Form = require('components/form');
    var Grid = require('components/grid');
    var API = require('models/api').API;
    var adtypes = require('../data/adtypes');

    return Page.extend({
        events: {
            'click .js_grid_delete': function (e) {
                var id = e.currentTarget.getAttribute('data-id');
                var name = e.currentTarget.getAttribute('data-name');
                var self = this;

                if (window.confirm('确认删除？')) {
                    $.post('/api/manage/delete_ad', {
                        name: name,
                        id: id
                    }, function (res) {
                        if (res.success) {
                            self.grid.load()
                        } else {
                            sl.tip(res.msg)
                        }

                    }, 'json');
                }
            },
            'click .js_click': function (e) {
                var id = e.currentTarget.getAttribute('data-id');
                var url = e.currentTarget.getAttribute('data-url');

                console.log(this.grid.data())

                util.store('current_ad', util.first(this.grid.data(), function (item) {
                    return item.ID == id;
                }))

                this.forward(url);
            }
        },

        onCreate: function () {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '广告位管理'
            });

            this.onResult('ad_change', function () {
                this.grid.load();
            });

            this.grid = new Grid({
                search: {
                    url: API.url('/api/settings/ad_list'),
                    type: 'GET',
                    beforeSend: function () {
                    },
                    data: {
                        name: {
                            label: '广告位置',
                            type: 'select',
                            options: adtypes
                        }
                    }
                },
                onSelectRow: function () {
                },
                columns: [{
                    text: "编号",
                    bind: "ID",
                    width: 5
                }, {
                        text: "广告名称",
                        bind: "Title",
                        width: 10
                    }, {
                        text: "广告图片",
                        bind: "Src",
                        width: 10,
                        render: function (data) {
                            this.append('<a href="' + data.Src + '" target="_blank">' + data.Src + '</a>');
                        }
                    }, {
                        text: "操作",
                        width: 10,
                        align: 'center',
                        valign: 'center',
                        render: function (data) {
                            var name = self.$('[name="name"]').val();
                            this.append($('<a href="javascript:;" class="js_click" data-id="' + data.ID + '" data-url="/settings/modify_ad/' + name + '/' + data.ID + '">[修改]</a>'))

                            this.append(' <a href="javascript:;" data-id="' + data.ID + '" data-name="' + name + '" class="js_grid_delete">[删除]</a>');
                        }
                    }]

            }).search();

            this.$el.find('.toolbar').after(this.grid.$el);
        },

        onShow: function () {
            this.menu = menu.get('/');
            this.$el.before(this.menu.$el);
        },

        onDestroy: function () {
        }
    });
});
