var $ = require('$');
var model = require('core/model2');
var api = require('models/base');
var Size = require('components/size');
var util = require('util');

var Month = model.ViewModel.extend({
	el: <div class="main sp_package">
		<div class="sp_package_hd" style="display:none">
			<div class="con">
				<h1>{{PPG_NAME}}</h1>
				<div class="text">{{PPG_MEMO}}</div>
			</div>
		</div>
		<div class="sp_package_bd" sn-repeat="item in data">
			<div class="hd">{{item.PPS_Model.PST_NAME}} <em>下方商品任选{{item.PPS_Model.PST_OPTIONAL_QTY}}件</em></div>
			<ul>
				<li sn-repeat="prod in item.PRD_List">
					<img sn-src="{{prod.WPP_LIST_PIC}}" data-forward="/item/{{prod.PRD_ID}}?from={{url}}" />
					<div class="name" sn-tap="this.selectSize(item,prod)">
						<span>{{prod.PRD_NAME}}</span>
						<b>选择 尺寸 颜色 ></b>
						<p class="qty"> <span class="minus">-</span> <input type="text" value="{{prod.qty||1}}" sn-model="changedQty"> <span class="plus">+</span> </p>
					</div>
					<p class="price">
						<em>￥{{prod.PRD_PRICE}}</em>
						<del sn-display="{{prod.PRD_PRICE!=0&&prod.PRD_PRICE<prod.PRD_MEMBER_PRICE}}" style="display: none;">￥{{prod.PRD_MEMBER_PRICE}}&nbsp;</del>
					</p>
				</li>
			</ul>
		</div>
	</div><div class="sp_package_ft">
		<div class="price">
			<em>总计：</em><b>¥{{PPG_PRICE}}</b>
		</div>
		<div class="buy" sn-tap="this.showList()">查看套餐商品（{{qty||0}}）</div>
	</div><div class="sp_package_list" sn-tap="this.hideList()" style="display:none">
		<div class="sp_package_hd">
			确认套餐清单
		</div>
		<div class="main">
			<div class="sp_package_bd" sn-repeat="item in data">
				<div class="hd">{{item.PPS_Model.PST_NAME}} <em>任选{{item.PPS_Model.PST_OPTIONAL_QTY}}件</em></div>
				<ul>
					<li sn-repeat="prod in item.list">
						<img sn-src="{{prod.WPP_LIST_PIC}}" />
						<div class="name">
							<span>{{prod.PRD_NAME}}</span>
						</div>
						<p class="price">
							<em>￥{{prod.PRD_PRICE}}</em>
							<del sn-display="{{prod.PRD_PRICE!=0&&prod.PRD_PRICE<prod.PRD_MEMBER_PRICE}}" style="display: none;">￥{{prod.PRD_MEMBER_PRICE}}&nbsp;</del>
						</p>
						<b>尺寸:{{prod.PRD_DISPLAY_SPEC}} 颜色:{{prod.PRD_COLOR}}  x{{prod.qty}}</b>
						<div class="btn" sn-tap="this.deleteItem(prod,item.PPS_Model.PST_ID)">删除</div>
					</li>
				</ul>
			</div>
		</div>
		<div class="sp_package_ft">
			<div class="buy" sn-tap="this.buy()">加入购物车</div>
		</div>
	</div>,
	
	deleteItem: function(e,prod,PST_ID){
		this.getModel('data').each(function(model,i){
			var ppsModel=model.get('PPS_Model');
			
			if (ppsModel.PST_ID==PST_ID){
				
				model.getModel('list').remove(util.indexOf(model.data.list,function(item) {
					return item.PRD_ID==prod.PRD_ID;
				}));
				return false;
			}
		});
				
		this.refreshQty();
	},
	
	refreshQty: function(){
		var self=this;
		var qty=0;
		for (var i=0;i<self.data.data.length;i++) {
			var data=self.data.data[i];
			for (var j=0;data.list&&j<data.list.length;j++) {
				qty+=data.list[j].qty;
			}
		}
		
		self.set({
			qty: qty
		})
	},
	
	_hideList: function(){
		this.$('.sp_package_list').hide();
	},
	
	showList: function(){
		this.$('.sp_package_list').show();
	},
	
	hideList: function(e){
		if ($(e.target).hasClass('sp_package_list')) {
			this._hideList();
		}
	},
	
	selectSize: function(e,item,product){
		var self=this;
		
		var color = [];
		var spec = [];
		var data=this.data.data;
		
		for (var i = 0, len = item.PRD_Lis.length; i < len; i++) {
			var prod = item.PRD_Lis[i];
			
			prod.PRD_SPEC=prod.PRD_DISPLAY_SPEC;
			
			if (color.indexOf(prod.PRD_COLOR) == -1) {
				color.push(prod.PRD_COLOR);
			}
			if (spec.indexOf(prod.PRD_DISPLAY_SPEC) == -1) {
				spec.push(prod.PRD_DISPLAY_SPEC);
			}
		}
		
		product.PRD_SPEC=product.PRD_DISPLAY_SPEC;
		
		self.size.set({
			PST_ID: item.PPS_Model.PST_ID,
			type: "package",
			color: color,
			spec: spec,
			colorSpec: item.PRD_Lis,
			data: product,
			qty: 1
		}).show();
	},
	
	buy: function(e, item) {
		var self=this;
		
		if (!this.data.qty){
			sl.tip('请选择套餐商品');
			return;
		}
		
		var prdIds='';
		var ppgId;
		for (var i=0;i<self.data.data.length;i++) {
			var data=self.data.data[i];
			
			ppgId=data.PPG_ID;
			prdIds+=data.PPS_Model.PST_ID+"-";
			
			if (!data.list) {
				sl.tip('请选择分组商品');
				return;
			}
			
			for (var j=0;j<data.list.length;j++) {
				for (var qty=0;qty<data.list[j].qty;qty++){
					prdIds+=data.list[j].PRD_ID+',';
				}
			}
			
			prdIds+='|';
		}
		
		self.cartAddAPI.setParam({
			ppgId: ppgId,
			prdIds: prdIds
		}).load();
	},
	
	initialize: function() {
		var self=this;
		
		self.user=util.store('user');
		
		self.set({
			url: encodeURIComponent(location.hash)
		});
		
		self.size = new Size({
			
			btn: '选择商品',
			
			confirm: function(item,pstId,qty){
				
				self.getModel('data').each(function(model,i){
					var ppsModel=model.get('PPS_Model');
					
					if (ppsModel.PST_ID==pstId){
						var max=ppsModel.PST_OPTIONAL_QTY;
						var list= model.get('list');
						list=list?[].concat(list):[];
						
						var count=0;
						for (var j=0;j<list.length;j++) {
							count+=list[j].qty;
						}
												
						if (count+qty>max){
							sl.tip('您选择的商品数量超过该组指定数量');
							return false;
						}
						list.push($.extend({},item,{ qty: qty }));
							
						model.set({
							list: list
						});
						return false;
					}
				});
				
				self.refreshQty();
				
				self.size.hide();
			}
		});
        
		self.size.$el.appendTo($('body'));
		
		var dataAPI=new api.PackageAPI({
			$el: self.$('.sp_package'),
			params: {
				id: this.data.id
			},
			success: function(res){
				console.log(res.data);
				var data=res.data[0];
				
				self.set({
					PPG_MEMO: data.PPG_MEMO,
					PPG_NAME: data.PPG_NAME,
					PPG_PRICE: data.PPG_PRICE,
					data: res.data
				});
			}
		});
		dataAPI.load();
		
		self.cartAddAPI = new api.PackageCartAPI({
			$el: self.$el,
			checkData: false,
			check: false,
			params: {
				pspcode: self.user.PSP_CODE
			},
			success: function (res) {
				if (res.success) {
					sl.tip('加入购物车成功！');
					
				} else {
					sl.tip(res.msg);
				}
			},
			complete: function () {
				self._hideList();
			}
		});
	}
});

module.exports = Month;