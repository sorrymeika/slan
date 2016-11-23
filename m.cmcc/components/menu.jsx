var $ = require('$');
var util = require('util');
var popup = require('widget/popup');
var Toast = require('widget/toast');

var Model = require('core/model2').Model;
var userModel = require('models/user');

var Menu = Model.extend({
    el: <div class="menu_exit menu">
        <div class="menu_user h_l flex">
            <img onerror="this.src='images/default.jpg'" sn-src="{sl.resource(user.avatars)}" class="gl_avatars dp_b" data-forward="/user/person" />
            <p class="fs_m ml_m flexitem" data-forward="/user/person">
                <span class="name dp_b">{user.user_name}</span>
                <span class="msg dp_b">ID：{user.user_id}</span>
            </p>
            <p class="user-qrcode mr_m" data-forward="/user/qrcode"></p>
        </div>
        <div class="menu_sign h_s ml_l mt_m fw_xs" data-forward="/user/set/sign_text">
            {user.sign_text || '编辑个性签名'}
        </div>
        <ul class="menu_list" ref="list">
            <li class="user-fav" data-forward="/user/fav">
                <span class="va_m">我的收藏</span>
            </li>
            <li class="user-wishlist" data-forward="/user/like">
                <span class="va_m">我的喜好</span>
            </li>
            <li class="user-chat" data-forward="/user/messages">
                <span class="va_m">我的消息</span>
            </li>
            <li class="user-setting" data-forward="/user/settings">
                <span class="va_m">系统设置</span>
            </li>
             <li class="user-list" data-forward="/user/qa">
                <span class="va_m">常见问题</span>
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