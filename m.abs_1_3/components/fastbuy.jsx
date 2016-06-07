var $ = require('$');
var model = require('core/model2');
var api = require('models/base');
var Size = require('components/size');
var util = require('util');

var Month = model.ViewModel.extend({
	el: <div class="main"><div class="sp_fastbuy" style="margin-bottom:10px">
		<dl sn-repeat="item in data" class="repeat">
			<dt><b></b><i>{{util.formatDate(item.time,item.timeLeft?'MM月dd日 HH:mm':'MM月dd日 即将开始')}}</i><span sn-display="{{item.timeLeft}}">{{item.timeLeft.indexOf('-')!=0?'还剩':''}}<em>{{item.timeLeft.indexOf('-')==0?'已结束':item.timeLeft}}</em></span></dt>
			<dd sn-repeat="prod in item.data">
				<img src="{{prod.WPP_LIST_PIC}}" sn-tap="this.goto(prod)">
				<div class="con">
					<span class="name">{{prod.PRD_NAME}}</span>
					<p class="price">
						<del sn-display="{{prod.PRD_PRICE!=0&&prod.PRD_PRICE<prod.PRD_MEMBER_PRICE}}" style="display: none;">￥{{prod.PRD_MEMBER_PRICE}}&nbsp;</del>
						<em>￥{{prod.PRD_PRICE}}</em>
					</p>
					<p class="fast_btn">
						<span>仅限<em>{{prod.flp_stock}}</em>件</span>
						<b class="btn{{!prod.qty||(item.timeLeft&&item.timeLeft.indexOf('-')==0)?' over':''}}" sn-tap="this.goto(prod)">{{item.timeLeft?(item.timeLeft.indexOf('-')!=0?(!prod.qty?'已抢完':'立即抢购'):'已结束'):'即将开始'}}</b>
					</p>
				</div>
			</dd>
		</dl>
	</div><div class="datanotfound fastbuy_nodata" sn-display="{{!data.length}}">
        <h1>FLASH SALE</h1>
        每周一上午10:00准点开抢
    </div></div>,
	
	goto: function(e, item) {
		var self=this;
		
		self.view.forward('/item/'+item.PRD_ID+"?from="+encodeURIComponent(self.view.route.url));

		/*
		self.cartAddAPI.setParam({
			prd: item.PRD_ID
			
		}).load();
		*/
		console.log(item)
	},
	
	timeDiff: function(dateFrom,dateTo) {
		if (+dateFrom>Date.now()||time) return '';
		
		var time=(+dateTo)-Date.now();
        
        if (time<0)
            return '-';
        
		var days=parseInt(time/(24*60*60*1000));
        
		time=time%(24*60*60*1000);
        
		var hours=parseInt(time/(60*60*1000));
        
		time=time%(60*60*1000);
		var minutes=parseInt(time/(60*1000));
		time=time%(60*1000);
		var secends=parseInt(time/(1000));
		time=time%(1000);
		
		return (days?days+'天 ':'')+util.pad(hours)+":"+util.pad(minutes)+":"+util.pad(secends);
	},
	
	initialize: function() {
		var self=this;
		
		self.user=util.store('user');
		
		self.set({
			url: encodeURIComponent(location.hash)
		});
        
        var now=new Date();
        var startDt;
        if (now.getDay()!=1) {
            startDt=new Date(Date.now()-(now.getDay()-1)*24*60*60*1000);
        } else {
            startDt=now;
        }
        var endDt=new Date((+startDt)+7*24*60*60*1000);
		
		var dataAPI=new api.FastBuyAPI({
			$el: self.$el,
            checkData: false,
			params: {
				startdt: util.formatDate(startDt,'yyyy-MM-dd 00:00:00'),
				enddt: util.formatDate(endDt,'yyyy-MM-dd 23:59:59')
			},
			success: function(res){
				var result=[];
				for (var i=0;i<res.data.length;i++) {
					var item=res.data[i];
					var prod=item.V_PRODUCT1;
					var time=eval("new "+item.flp_start_time.replace(/\//g,''));
					var endTime=eval("new "+item.flp_end_time.replace(/\//g,''));
					var strTime=util.formatDate(time);
					var strEndTime=util.formatDate(endTime);
                    
                    if (+time>Date.now()){
                        continue;
                    }
					
					var data=util.first(result,function(compare){
						return compare.strTime==strTime&&compare.strEndTime==strEndTime;
					});
					var prodInfo= {
						PRD_ID: prod.PRD_ID,
						WPP_LIST_PIC: prod.WPP_LIST_PIC,
						PRD_NAME: prod.PRD_NAME,
						PRD_PRICE: item.flp_price,
						PRD_MEMBER_PRICE: prod.PRD_MEMBER_PRICE,
						flp_stock: item.flp_stock,
						qty: item.qty
					}
					if (data) {
						data.data.push(prodInfo);
						
					} else {
						result.push({
							strTime: strTime,
							strEndTime: strEndTime,
							timeLeft:self.timeDiff(time,endTime),
							time: time,
							endTime: endTime,
							data: [prodInfo]
						});
					}
                    
				}
				
				setInterval(function(){
					self.getModel('data').each(function(model,i){
						model.set({
							timeLeft:self.timeDiff(model.data.time,model.data.endTime),
						})
					});
					
				},1000);
				
				self.set({
					data: result
				});
			}
		});
		dataAPI.load();
		
		self.cartAddAPI = new api.CartAddAPI({
			$el: self.$el,
			checkData: false,
			check: false,
			params: {
				pspcode: self.user.PSP_CODE
			},
			success: function (res) {
				if (res.success) {
					sl.tip('加入购物车成功！');
				}
			},
			complete: function () {
			}
		});
	}
});

module.exports = Month;