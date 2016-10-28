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
            title: '数据库管理',
            url: '/databases',
            children: [{
                title: '连接',
                url: '/connect'
            }]
        }]
    });

    menu.$el.appendTo(app.$el);
}


module.exports = {
    startApp: startApp
}