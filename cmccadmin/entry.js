var $ = require('$');
var Base = require('core/base');
var Navigation = require('core/navigation');

function startApp(routes, resourceMapping) {

    seajs.on('fetch', function(emitData) {

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

    seajs.use(['common/menu', 'logical/auth'], function(Menu, auth) {

        var app = new Navigation({
            routes: routes

        }).start();

        var menu = new Menu({
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
            },{
                title: '提醒业务管理',
                url: '/business/index',
                children: [{
                    title: '通知管理',
                    url: '/notification/index'
                }]
            }]
        });

        menu.$el.appendTo(app.$el);
    })
}

module.exports = {
    startApp: startApp
}