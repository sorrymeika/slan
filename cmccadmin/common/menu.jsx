var vm = require('core/model2');
var auth = require('logical/auth');

module.exports = vm.ViewModel.extend({
    el: <div class="menu" display="{$global.adminId}" style="display:none">
        <div class="menu_hd">
            菜单
        </div>
        <div class="menu_sub_hd fw_b">{$global.adminName}-  <a href="javascript:;" sn-click="this.logout()"> [退出系统]</a></div>
        <div class="menu_bd">
            <dl sn-repeat="item in data">
                <dt class="{currentUrl==item.url?'curr':''}" sn-click="currentUrl=item.url,item.open=true">
                    <span sn-click="item.open=!item.open">{!item.children ? '' : item.open ? '－' : '＋'}</span><a href="{item.url||'javascript:;'}">{item.title}</a>
                </dt>
                <dd sn-repeat="child in item.children" display="{item.open}" class="{currentUrl==child.url?'curr':''}">
                    <a href="{child.url||'javascript:;'}" sn-click="currentUrl=child.url">{child.title}</a>
                </dd>
            </dl>
        </div>
    </div>,

    logout: function () {
        auth.clearAuth();
        location.hash = '/login';
    },

    viewDidUpdate: function () {
        var tk = auth.getAuthToken();

        if (!tk) {
            this.logout();
        }
    },

    initialize: function () {

        var self = this;

        $(window).on('hashchange', function () {
            self.set({
                currentUrl: location.hash.replace(/^#/, '')
            });
        });

        var url = location.hash.replace(/^#/, '');

        this.set({
            currentUrl: url
        });
    }
});

