var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var ShareOrder = require('components/shareOrder');
var Month = require('components/month');
var Activ = require('components/activity');
var FastBuy = require('components/fastbuy');
var Package = require('components/package');
var Banner = require('components/banner');
var api = require("models/base");

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    onCreate: function () {
        var self = this;
        
        self.swipeRightBackAction = self.route.query.from || '/';

        var id = self.route.data.id;
        var m = /(order|month|activity|package|fastbuy|banner|coupon){0,1}(\d*)/.exec(id);
        var type = m[1];
        id = m[2];

        self.model = new model.ViewModel(this.$el, {
            url: encodeURIComponent(self.route.url),
            back: self.swipeRightBackAction
        });

        var title = '';
        var component;

        switch (type) {
            case 'order':
                title = "支付成功";
                component = new ShareOrder({
                    id: id
                });
                component.$el.appendTo(self.$el);
                break;
            case 'month':
                title = "会员礼领取";
                component = new Month({
                    id: id
                });
                component.$el.appendTo(self.$el);
                break;
            case 'fastbuy':
                title = "周一闪购";
                component = new FastBuy();
                component.$el.appendTo(self.$el);
                break;
            case 'activity':
                title = id == 2 ? "最热商品" : "APP专享";
                component = new Activ({
                    id: id
                });
                component.$el.appendTo(self.$el);
                break;
            case 'package':
                title = "套餐";
                component = new Package({
                    id: id
                });
                component.$el.appendTo(self.$el);
                break;
            case 'banner':
                title = "纳米美容巾免费领";
                component = new Banner({
                    id: id
                });
                component.$el.appendTo(self.$el);
                break;
            case 'coupon':
                title = "优惠券规则";
                self.$el.append(<div class="main" style="padding:20px;background:#fff;">
                Q：如何使用优惠券？<br/>
A：您可以在订单结算页面通过“使用优惠券”选项使用一张符合使用条件的优惠券，抵扣相应的金额。<br/>
<br/>
Q：什么是券码？<br/>
A：用户可以通过ABS其他合作渠道获取兑换券码，兑换码可以在"我的优惠券”页兑换优惠券，抵扣相应金额。<br/>
<br/>
Q：优惠券的使用有什么其他限制吗？<br/>
A：优惠券的使用时限、抵用限额及其他限制条件请详见优惠券上的文字描述。<br/><br/>
Q：申请退款时优惠券如何结算？<br/>
A：使用优惠券订单，如非质量问题，不支持退货退款。<br/>
如因商品质量问题需要退货，所使用优惠券均不予返还。<br/>
                    </div>);
                break;
            default:
                title = "ABS家居";
                
                var $main=$(<div class="main"></div>).appendTo(self.$el);
                
                var newsApi = new api.NewsAPI({
                    $el: self.$el,
                    params: {
                        id: id
                    },
                    success: function(res) {
                        var content;
                        if (res.success) {
                            if (res.edmtype == 1) {
                                var iframe = self.createIFrame($main);
                                iframe.$el.css({
                                    width: window.innerWidth,
                                    height: $main[0].offsetHeight
                                })
                                iframe.html("<style>body,html{background:#fff}</style>"+res.data.edm_html);
                            } else {
                                var $template=$(<div sn-repeat="list in data">
                                    <div class="banner" sn-if="{{list.type==1}}">
                                    <a sn-repeat="pic in list.data" href="{{pic.EDD_URL||'javascript:;'}}"><img sn-src="{{list.type==1?pic.EDD_PIC:''}}"  /></a>
                                    </div>
                                    <ul class="sp_list" style="overflow:hidden;margin-top:0" sn-if="{{list.type==2}}">
                                    <li sn-repeat="item in list.data" class="sp_list_item" data-forward="/item/{{item.PRD_OBJ.PRD_ID}}?from={{url}}" sn-index="0"> <img src="{{item.PRD_OBJ.WPP_LIST_PIC}}"> 
                                        <p class="price"><b>￥{{item.PRD_OBJ.PRD_PRICE}}</b><del sn-display="{{item.PRD_OBJ.PRD_PRICE!=0&&item.PRD_OBJ.PRD_PRICE<item.PRD_OBJ.PRD_MEMBER_PRICE}}" style="display: none;">￥{{item.PRD_OBJ.PRD_MEMBER_PRICE}}&nbsp;</del></p> 
                                        <p class="name">{{item.PRD_OBJ.PRD_NAME}}</p> </li>
                                    </ul>
                                </div>);
                                
                                $template.appendTo($main);
                                
                                self.model.bind($template)
                                    .set({
                                        data: res.data
                                    });
                                
                                
                            }
                        } else {
                            sl.tip(res.msg);
                        }
                        
                    },
                    error: function(res) {
                        sl.tip(res);
                    }
                });
                newsApi.load();
                break;
        }
        component&& (component.view = self);
        

        Scroll.bind(self.$('.main'));

        self.model.set({
            type: type,
            title: title
        })
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});