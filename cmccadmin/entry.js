var $ = require('$')
var Navigation = require('core/navigation')
var Menu = require('common/menu');
var auth = require('logical/auth');


function startApp(routes) {
    var app = new Navigation().mapRoute(routes).start();

    var menu = new Menu({
        data: [{
            title: '首页',
            url: '/'
        }, {
            title: '公众圈管理',
            url: '/pub_quan/index',
            children: [{
                title: '添加',
                url: '/pub_quan/add'
            }]
        }]
    });

    menu.$el.appendTo(app.$el);
}


module.exports = {
    startApp: startApp
}