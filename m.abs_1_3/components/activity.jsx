var $ = require('$');
var model = require('core/model2');
var api = require("models/base");
var Scroll = require('widget/scroll');

var Month = model.ViewModel.extend({
	el:<div class="main">
		<div class="hm_shop">
			<div sn-repeat="item in activity">
				<div sn-if="{{item.type==1}}" class="hm_shop_banner js_scroll">
                    <ul style="width:{{item.data.length*100}}%">
                        <li><img sn-src="{{img.src}}" sn-repeat="img in item.data" data-forward="{{img.url}}?from={{encodeURIComponent('/news/activity'+id)}}" /></li>
                    </ul>
                </div>
				<div sn-if="{{item.type==2}}" class="hm_shop_scroll js_scroll">
					<ul class="{{type=='H'?'hm_shop_list':'sp_list'}}">
						<li class="{{type=='H'?'hm_shop_list_item':'sp_list_item'}}" sn-repeat="prd in item.data" data-forward="/item/{{prd.PRD_ID}}?from={{encodeURIComponent('/news/activity'+id)}}">
							<img sn-src="{{prd.WPP_LIST_PIC}}" />
							<p class="price">￥{{prd.PRD_PRICE}} <del sn-display="{{prd.PRD_SPECIAL_FLAG}}">¥{{prd.PRD_MEMBER_PRICE}}</del></p>
							<p class="name">{{prd.PRD_NAME}}</p>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>,
	
	initialize: function() {
		var self=this;
		
		self.shopApi = new api.ActivityAPI({
            $el: self.$('.hm_shop'),
			params: {
				h5name: 'api_prod'+this.data.id
			},
            success: function (res) {
                
                self.set({
                    activity: res.data
                });
				
                Scroll.bind(self.$('.js_scroll:not(.s_binded)').addClass('s_binded'), {
                    vScroll: false,
                    hScroll: true
                });
            }
        });

        self.shopApi.load();
	}
});

module.exports = Month;