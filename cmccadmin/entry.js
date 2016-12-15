var $ = require('$');
var Base = require('core/base');
var Navigation = require('core/navigation');
var Toast = require('widget/toast');
var util = require('util');

sl.tip = function (msg) {
    Toast.showToast(msg);
}

function startApp(routes, resourceMapping) {

    seajs.on('fetch', function (emitData) {

        var id = emitData.uri.replace(seajs.data.base, '').replace(/\.js(\?.*){0,1}/, '');

        if (resourceMapping) {

            for (var key in resourceMapping) {
                if (resourceMapping[key].indexOf(id) != -1) {
                    emitData.requestUri = seajs.resolve(key);
                    break;
                }
            }
        }
    });

    seajs.use(['common/menu', 'logical/auth'], function (Menu, auth) {

        var app = new Navigation({
            routes: routes

        }).start();

        var MENU_DATA = 'MENU_DATA';

        var menu = new Menu($.extend(true, {
            data: [{
                title: '首页',
                url: '/'
            }, {
                title: '国家/省/市管理',
                url: '/country/index',
                children: [{
                    title: '添加国家',
                    url: '/country/add'
                }, {
                    title: '省管理',
                    url: '/province/index'
                }, {
                    title: '市管理',
                    url: '/city/index'
                }]
            }, {
                title: '公众圈管理',
                url: '/pub_quan/index',
                children: [{
                    title: '文章管理',
                    url: '/pub_quan_msg/index/0'
                }, {
                    title: '推荐管理',
                    url: '/pub_quan_recommend/index'
                }]
            }, {
                title: '圈管理',
                url: '/quan_msgs/index',
                children: []
            }, {
                title: '用户管理',
                url: '/userinfo/index'
            }, {
                title: '云米管理',
                url: '/user_yunmi/index',
                children: [{
                    title: '添加云米时段',
                    url: '/user_yunmi/add'
                }]
            }, {
                title: '提醒业务管理',
                url: '/business/index',
                children: [{
                    title: '通知管理',
                    url: '/notification/index'
                }, {
                    title: '推送移动营业厅',
                    url: '/notification/easy/100001'
                }, {
                    title: '推送12580求职',
                    url: '/notification/easy/100002'
                }, {
                    title: '推送12580商城',
                    url: '/notification/easy/100003'
                }, {
                    title: '推送娱乐提醒',
                    url: '/notification/easy/100022'
                }, {
                    title: '推送和聚宝提醒',
                    url: '/notification/easy/100026'
                }, {
                    title: '推送水费提醒',
                    url: '/notification/easy/100004'
                }, {
                    title: '推送电费提醒',
                    url: '/notification/easy/100005'
                }, {
                    title: '139邮箱提醒',
                    url: '/notification/easy/100043'
                }]
            }, {
                title: '新闻/广告位管理',
                url: '/news/index',
                children: [{
                    title: '分类管理',
                    url: '/news_category/index'
                }]
            }]

        }, util.store(MENU_DATA)));

        menu.on('datachanged', function () {
            util.store(MENU_DATA, {
                currentUrl: this.data.currentUrl,
                data: this.data.data.map(function (item) {
                    return {
                        open: item.open
                    }
                })
            });
        })

        menu.$el.appendTo(app.$el);
    })
}

module.exports = {
    startApp: startApp
}