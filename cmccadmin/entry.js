var Base = require('core/base');

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

    seajs.use(['$', 'core/navigation', 'common/menu', 'logical/auth'], function ($, Navigation, Menu, auth) {

        var app = new Navigation().mapRoute(routes).start();

        var menu = new Menu({
            data: [{
                title: '首页',
                url: '/'
            }, {
                title: '用户管理',
                url: '/userinfo/index'
            }, {
                title: '公众圈管理',
                url: '/pub_quan/index',
                children: [{
                    title: '添加',
                    url: '/pub_quan/add'
                }, {
                    title: '文章管理',
                    url: '/pub_quan_msg/index/0'
                }]
            }, {
                title: '圈管理',
                url: '/quan_msgs/index'
            }]
        });

        menu.$el.appendTo(app.$el);
    })
}

module.exports = {
    startApp: startApp
}