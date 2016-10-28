var vm = require('core/model2');
var auth = require('logical/auth');

module.exports = vm.ViewModel.extend({
    el: <div class="menu" sn-display="$global.adminId" style="display:none">
        <div class="menu_hd">
            菜单
        </div>
        <div class="menu_sub_hd fw_b">{$global.adminName}-  <a href="javascript:;" sn-click="this.logout()"> [退出系统]</a></div>
        <div class="menu_bd">
            <dl sn-repeat="item in data">
                <dt class="{item.current?'curr':''}" sn-click="item.current=true,item.currentChild=item.url">
                    <span sn-click="item.current=!item.current">{!item.children ? '' : item.current ? '－' : '＋'}</span><a href="{item.url||'javascript:;'}">{item.title}</a>
                </dt>
                <dd sn-repeat="child in item.children" sn-display="{item.current}" class="{item.currentChild==child.url?'curr':''}">
                    <a href="{child.url||'javascript:;'}" sn-click="item.currentChild=child.url">{child.title}</a>
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

        $(window).on('hashchange', this.viewDidUpdate.bind(this));

        var url = location.hash.replace(/^#/, '');

        this.getModel('data').each(function (item, i) {
            var isContinue = true;

            if (item.data.url == url) {
                item.set({
                    current: true,
                    currentChild: url
                });
                isContinue = false;
            }

            item.get("children") && item.getModel('children').each(function (child, j) {
                if (child.data.url == url) {
                    child.set({
                        current: true
                    })
                    item.set({
                        current: true,
                        currentChild: url
                    })
                    isContinue = false;
                    return false;
                }
            });
            return isContinue;
        })

    }


});

