var $ = require('$');
var util = require('util');

var Model = require('core/model2').Model;
var userModel = require('models/user');

var Menu = Model.extend({
    el: <div class="menu_exit menu">
        <div class="menu_user h_l flex">
            <img sn-src="{user.avatars}" class="gl_avatars dp_b"/>
            <p class="fs_m ml_m flexitem">
                <span class="name dp_b">{user.user_name}</span>
                <span class="msg dp_b">ID：{user.user_id}</span>
            </p>
            <p class="user-qrcode mr_m"></p>
        </div>
        <div class="menu_sign h_s ml_l mt_m fw_xs">
        {user.sign_text}
        </div>
        <ul class="menu_list" ref="list">
            <li class="user-fav">
                <span class="va_m">我的收藏</span>
            </li>
            <li class="user-wishlist">
                <span class="va_m">我的喜好</span>
            </li>
            <li class="user-chat">
                <span class="va_m">我的消息</span>
            </li>
            <li class="user-setting">
                <span class="va_m">系统设置</span>
            </li>
            <li class="user-del">
                <span class="va_m">清除缓存</span>
            </li>
            <li class="user-new">
                <span class="va_m">检测更新</span>
            </li>
            <li class="user-list">
                <span class="va_m">常见问题</span>
            </li>
            <li class="user-about">
                <span class="va_m">关于和生活</span>
            </li>
            <li class="user-user">
                <span class="va_m">退出登录</span>
            </li>
        </ul>
    </div>,

    initialize: function () {
        this.set({
            user: userModel
        });

        this.bindScrollTo(this.refs.list);
    }
})

module.exports = Menu;