var vm = require('core/model');

module.exports = vm.ViewModel.extend({
    el: <div class="menu">
        <div class="menu_hd">
            菜单
        </div>
        <div class="menu_sub_hd"><a href="/login">退出系统</a></div>
        <div class="menu_bd">
            <dl sn-repeat="item in data">
                <dt class="{{item.current?'curr':''}}" sn-click="item.current=true,item.currentChild=item.url">
                    <span sn-click="item.current=!item.current">{{ item.current ? '－' : '＋' }}</span><a href="{{item.url||'javascript:;'}}">{{ item.title }}</a>
                </dt>
                <dd sn-repeat="child in item.children" sn-display="{{item.current}}" class="{{item.currentChild==child.url?'curr':''}}">
                    <a href="{{child.url||'javascript:;'}}" sn-click="item.currentChild=child.url">{{ child.title }}</a>
                </dd>
            </dl>
        </div>
    </div>,

    initialize: function() {

        var url = location.hash.replace(/^#/, '');

        this.getModel('data').each(function(item, i) {
            var isContinue = true;

            if (item.data.url == url) {
                item.set({
                    current: true,
                    currentChild: url
                });
                isContinue = false;
            }

            item.getModel('children').each(function(child, j) {
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

