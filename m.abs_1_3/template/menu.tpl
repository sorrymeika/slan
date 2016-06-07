<div class="menu_bd">
    <div class="menu_user" sn-binding="data-back:memberUrl">
        <div class="menu_username" sn-binding="display:user">
            <h1>
                <text sn-binding="html:user.UserName|or:user.Mobile"></text>
                <span>编辑信息</span>
            </h1>
            <h2 sn-binding="html:user.BirthDay|date:'yyyy/MM/dd'"></h2>
        </div>
        <div class="menu_username" sn-binding="display:user|isFalse" style="display:none">
            <div class="btn_mid">登录</div>
        </div>
    </div>
    <ul class="menu_list menu_my">
        <li data-forward="/month">我的月礼</li>
        <li data-forward="/mycard">我的卡券</li>
        <li data-forward="/mypoint">积分钱包</li>
        <li data-forward="/myorder">我买到的</li>
    </ul>
    <ul class="menu_list menu_service">
        <!--<li data-forward="/guide">新手指南</li>-->
        <li><a href="tel:4008205077">联系客服</a></li>
    </ul>
    <ul class="menu_list menu_settings">
        <li data-forward="/settings">设置</li>
    </ul>
</div>