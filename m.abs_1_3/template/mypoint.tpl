<header>
    <div class="head_back" sn-binding="data-back:back"></div>
    <div sn-binding="html:title" class="head_title"></div>
</header>
<div class="main mypoint">
    <div sn-binding="display:points|equal:0|not">
        <div class="curr">当前积分：<b sn-binding="html:points"></b></div>
        <div class="notice">*您的积分可以直接抵扣现金使用。<span>（100积分＝1元）</span></div>
        <div class="hd">积分记录</div>
        <ul class="mypoint_list">
            <li sn-repeat="item in data">
                <p class="from" sn-binding="html:item.HPT_PIT_ID|equal:1:item.CNL_DESC:item.POT_DESC"></p>
                <p class="date" sn-binding="html:item.HPT_DT|date:'yyyy.MM.dd'"></p>
                <p class="points" sn-binding="html:item.HPT_POINT_AMOUNT|round|eval:'$0>0?\'+\'+$0:$0',class:item.HPT_POINT_AMOUNT|lt:0|equal:true:'minus':''"></p>
            </li>
        </ul>
    </div>
    <div class="my_nodata" sn-binding="display:points|equal:0" style="display:none">
        <div class="icon"></div>
        <div class="text">您目前还没有积分记录哦</div>
        <div class="btn" data-forward="/all">去逛逛吧</div>
    </div>
</div>