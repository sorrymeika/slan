<header>
    <div sn-binding="html:title" class="head_title"></div>
    <div class="head_back" sn-binding="data-back:back"></div>
</header>
<div class="main">
    <div class="login_form">
        <ul class="form">
            <li><input placeholder="输入手机号" sn-model="mobile" /></li>
            <li><input placeholder="验证码" sn-model="smsCode" type="text" /> <b class="js_valid btn_middle" sn-binding="html:valid"></b></li>
            <li><input placeholder="设置密码" sn-model="password" type="password" /></li>
            <li><input placeholder="再次输入确认密码" sn-model="password1" type="password" /></li>
        </ul>
        <div class="login_btn"><b class="btn_large js_bind">确定注册</b> </div>
    </div>
</div>
