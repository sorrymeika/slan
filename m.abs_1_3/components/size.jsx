var $ = require('$');
var model = require('core/model2');
var api = require('models/base');
var util = require('util');
var Scroll = require('widget/scroll');

var Month = model.ViewModel.extend({
	el: <div class="pd_size_wrap js_size {{isShowSize?'':'out'}}" style="display:none" sn-tap="this.tap()">
		<div class="pd_size">
			<div class="pd_size_close" sn-tap="isShowSize=false"></div>
			<div class="base_info">
				<div class="img"><img src="{{data.WPP_LIST_PIC||data.WPP_M_PIC}}" /></div>
				<div class="info">
					<h2 class="price">¥{{ data.PRD_PRICE }}</h2>
					<div class="qty">库存{{ data.PRD_NUM }}件</div>
					<p class="other">
						<em>选择</em>
						<em>尺码</em>
						<em>颜色分类</em>
					</p>
				</div>
			</div>
			<div class="pd_size_con">
				<div class="pd_size_select">
					<div class="hd">尺码</div>
					<ul>
						<li sn-repeat="item in spec" class="{{data.PRD_SPEC==item?'curr':this.isInList(item,data.PRD_COLOR,colorSpec)?'':'disabled'}}" sn-tap="this.setSpec(item)">{{ item.split('|')[0] }}</li>
					</ul>
				</div>
				<div class="pd_size_select">
					<div class="hd">颜色分类</div>
					<ul>
						<li sn-repeat="item in color" class="{{data.PRD_COLOR==item?'curr':this.isInList(data.PRD_SPEC,item,colorSpec)?'':'disabled'}}" sn-tap="this.setColor(item)">{{ item }}</li>
					</ul>
				</div>
			</div>
			<div class="pd_size_buy">
				<p class="hd">购买数量</p>
				<p class="qty"><em sn-tap="qty=Math.max(1,qty-1)">-</em>
					<input type="text" class="qty" sn-model="qty" value="{{qty}}" />
					<em sn-tap="qty=qty+1">+</em>
				</p>
			</div>
			<b class="btn_large btn_confirm{{data.PRD_NUM===0?' disabled':''}}" sn-tap="this.confirm()">{{ data.PRD_NUM === 0 ? '商品已售罄' : (btn || '确认') }}</b>
		</div>
	</div>,

    isInList: function (spec, color, colorSpec) {

        return !!util.first(colorSpec, function (item) {
			return item.PRD_SPEC == spec && item.PRD_COLOR == color;
		});
    },

	setSpec: function (e, item) {
        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }
        this.set("data.PRD_SPEC", item);
        this.onChange();
    },

    setColor: function (e, item) {
        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }
        this.set("data.PRD_COLOR", item);
        this.onChange();
    },

    onChange: function () {
        var self = this;
		var colorSpec = self.get('colorSpec');
		var data = self.get('data');

		var item = util.first(colorSpec, function (item) {
			return item.PRD_SPEC == data.PRD_SPEC && item.PRD_COLOR == data.PRD_COLOR;
		});

        if (item) {
            if (item.PRD_PRICE !== undefined) {
                this.set("data.PRD_PRICE", item.PRD_PRICE);
            }
            if (item.PRD_NUM !== undefined) {
                this.set("data.PRD_NUM", item.PRD_NUM);
            }
            if (item.WPP_LIST_PIC !== undefined) {
                this.set("data.WPP_LIST_PIC", item.WPP_LIST_PIC);
            }

        }
        this.trigger("SizeChange", item);
    },

	show: function () {
		this.$el.show();
		this.set({
			isShowSize: true
		});
	},

	confirm: function (e) {
		var self = this;
		var colorSpec = self.get('colorSpec');
		var data = self.get('data');
		var item = util.first(colorSpec, function (item) {
			return item.PRD_SPEC == data.PRD_SPEC && item.PRD_COLOR == data.PRD_COLOR;
		});

		if (this.data.type == 'package') {
			this.data.confirm(item, this.data.PST_ID, self.get('qty'));

		} else {

            self.set({ data: item });

            if (item.PRD_NUM === 0) {
                sl.tip('该商品已售罄');
                return;
            }

			self.cartAddAPI.setParam({
				prd: item.PRD_ID,
				qty: self.get('qty')

			}).load();
		}
	},
	hide: function () {
		this.set({
			isShowSize: false
		});
	},

	tap: function (e) {
		if ($(e.target).hasClass('js_size')) {
			this.hide();
		}
	},

	initialize: function () {
		var self = this;
		self.user = util.store('user');

		Scroll.bind(self.$('.pd_size_con'));

		self.listenTo(self.$el, $.fx.transitionEnd, function (e) {
			if (self.$el.hasClass('out')) {
				self.$el.hide();
			}
		});

		self.cartAddAPI = new api.CartAddAPI({
			$el: self.$el,
			checkData: false,
			check: false,
			beforeSend: function () {
				if (self.data.type == 'month') {
					this.setUrl('/api/prod/addmemberbag')
						.setParam({
							prdid: self.get('data').PRD_ID,
							freid: self.get('freid')
						});

				} else {
					this.setParam({
						prd: self.get('data').PRD_ID
					})
				}
				self.$('.js_buy').addClass('disabled');
			},
			params: {
				pspcode: self.user.PSP_CODE
			},
			success: function (res) {
				if (res.success) {
                    sl.activity.setResult('CartChange');

					sl.tip('加入购物车成功！');
					self.hide();
					//self.forward('/cart?from=' + self.route.url);
				} else {
                    sl.tip(res.msg);
                }
			},
			complete: function () {
				self.$('.js_buy').removeClass('disabled');
			}
		});
	}
});

module.exports = Month;