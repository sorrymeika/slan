var $ = require('$');
var model = require('core/model');
var api = require("models/api");
var Scroll = require('widget/scroll');

var Month = model.ViewModel.extend({
	el: <div class="cp_category_mask" style="display:none">
		<div class="cate_popup_hd">全部分类</div>
		<div class="cate_popup_bd">
			<ul class="cate_popup_list">
				<li sn-repeat="item in data" class="{{item.PCG_ID==current?'curr ':''}} cate{{item.PCG_ID}}" sn-tap="goto(item.PCG_ID)">{{ item.PCG_NAME }}</li>
			</ul>
		</div>
	</div>,

	initialize: function () {
		var self = this;

		self.listen("tap", function (e) {
			if ($(e.target).hasClass('cate_popup_bd') || $(e.target).hasClass('cate_popup_hd')) {
				self.hide();
			}
		});
	},

	aboutUs: function (e) {
		this.$el.hide();
		Application.forward('/news/200');
	},

	home: function () {
		this.$el.hide();
		Application.back('/');
	},

	show: function () {
		this.$el.show();
	},

	hide: function () {
		this.$el.hide();

	}
});

module.exports = Month;