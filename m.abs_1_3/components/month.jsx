var $ = require('$');
var model = require('core/model2');
var api = require('models/base');
var Size = require('components/size');
var util = require('util');

var Month = model.ViewModel.extend({
	el: <div class="main"><div class="uc_month_get" style="margin-bottom:10px">
		<ul class="list">
			<li sn-repeat="item in month">
            <p class="img"><img src="{{item.WPP_LIST_PIC}}"></p>
			<p class="con">
				<span class="name">{{item.PRD_NAME}}</span>
				<em>￥0</em>
				<del>￥{{item.PRD_PRICE}}&nbsp;</del>
				<b class="btn" sn-tap="this.showSize(item)">免费领取</b>
			</p></li>
		</ul>
        <div sn-repeat="list in data">
            <img class="banner" sn-src="{{list.type==1?list.data:''}}"  sn-if="{{list.type==1}}" />
            <ul class="sp_list" style="overflow:hidden" sn-if="{{list.type==2}}">
            <li sn-repeat="item in list.data" class="sp_list_item" data-forward="/item/{{item.PRD_ID}}?from={{url}}" sn-index="0"> <img src="{{item.WPP_LIST_PIC}}"> 
                <p class="price"><b>￥{{item.PRD_PRICE}}</b><del sn-display="{{item.PRD_PRICE!=0&&item.PRD_PRICE<item.PRD_MEMBER_PRICE}}" style="display: none;">￥{{item.PRD_MEMBER_PRICE}}&nbsp;</del></p> 
                <p class="name">{{item.PRD_NAME}}</p> </li>
            </ul>
        </div>
        
	</div></div>,
	
	showSize: function(e, item){
		
		this.colorAndSpec.setParam({
			id: item.PRH_ID
			
		}).load();
        
		this.size.set({
			data: item
			
		}).show();
		
	},
	
	initialize: function() {
		var self=this;
		
		self.set({
			url: encodeURIComponent(location.hash)
		});
		
		self.size = new Size();
            
		self.size.$el.appendTo($('body'));
		
		var monthAPI=new api.MonthAPI({
			$el: self.$el,
			checkData: false,
			params: {
				freid: this.data.id
			},
			success: function(res){
				var result=[];
				for (var i=0;i<res.data.length;i++) {
					if (util.indexOf(result,function(item){
						return item.PRH_ID==res.data[i].PRH_ID;
					})==-1) {
						result.push(res.data[i]);
					}
				}
				self.records=res.data;
				self.set({
					month: result
				});
			}
		});
		monthAPI.load();
		
		var monthProdApi=new api.MonthProductAPI({
			$el: self.$el,
			success: function(res){
				self.set(res);
			}
		});
		monthProdApi.load();
		
		self.colorAndSpec = new api.ProductColorAndSpec({
			$el: self.size.$el,
			checkData: false,
			success: function (res) {
				var color = [];
				var spec = [];
				for (var i = 0, len = res.data.length; i < len; i++) {
					var item = res.data[i];
					
					if (util.indexOf(self.records,function(record){
						return (record.PRD_ID==item.PRD_ID)
					})!=-1) {
						if (color.indexOf(item.PRD_COLOR) == -1) {
							color.push(item.PRD_COLOR);
						}
						if (spec.indexOf(item.PRD_SPEC) == -1) {
							spec.push(item.PRD_SPEC);
						}
					}
					
				}
				
				var data=self.size.data.data;
				var item = util.first(res.data, function (item) {
					return item.PRD_ID == data.PRD_ID;
				});
				console.log(res.data);
				
				self.size.set({
					freid: self.data.id,
					type: "month",
					color: color,
					spec: spec,
					colorSpec: res.data,
					data: item,
					qty: 1
				});
			}
		});
	}
});

module.exports = Month;