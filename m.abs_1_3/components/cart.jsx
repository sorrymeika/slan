var $ = require('$');
var util = require('util');
var vm = require('core/model2');
var api = require("models/api");
var Scroll = require('widget/scroll');
var Toast = require('widget/toast');
var Deletion = require("widget/deletion");
var popup = require("widget/popup");
var userModel = require('models/user');

var Model = vm.Model;
var Global = vm.Global;

var Cart = Model.extend({

	defaultData: {
		loading: true
	},

	initialize: function () {
		var self = this;

		self.user = userModel.get();

		self.cartApi = new api.CartAPI({
			$el: self.$el,
			checkData: false,

			params: {
                pspcode: self.user.PSP_CODE
			},

			success: function (res) {
				res.coupon.sort(function (a, b) {
					return a.CSV_END_DT > b.CSV_END_DT ? 1 : a.CSV_END_DT == b.CSV_END_DT ? 0 : -1;
				});

				var count = 0;

				if (res.data_package) {
					for (var i = 0; i < res.data_package.length; i++) {
						var item = res.data_package[i];
						for (var j = 0; j < item.PackageList.length; j++) {

							count += item.PackageList[j].SPB_QTY;
						}
					}
				}

				if (res.data_baglist) {
					for (var i = 0; i < res.data_baglist.length; i++) {
						count += res.data_baglist[i].SPB_QTY;
					}
				}

				res.total = count;
				res.loading = false;

				res.data_package = [{
					PPG_NAME: 'xxx',
					PackageList: [$.extend({}, res.data_baglist[0])]

				}, {
						PPG_NAME: 'xx1x',
						PackageList: [$.extend({}, res.data_baglist[0]), $.extend({}, res.data_baglist[0])]

					}]

				self.set(res);

				var couponCount = 0;
				var freeCount = 0;
				var cpItem;
				var matchCoupon;
				for (var i = 0; i < res.coupon.length; i++) {
					cpItem = res.coupon[i];
					if (cpItem.VCT_ID == 4) {
						freeCount++
					} else {
						couponCount++;

						if (self.data.couponcode && cpItem.CSV_CODE == self.data.couponcode.CSV_CODE) {
							matchCoupon = cpItem;
						}
					}
				}

				if (self.data.couponcode && ((self.data.couponcode.VCT_ID != 5 && !matchCoupon) || (self.data.couponcode.VCT_ID == 1 && self.data.couponcode.VCA_MIN_AMOUNT > self.data.bag_amount))) {
					self.set({
						couponcode: null
					});
				}

				self.set({
					freeCount: freeCount,
					couponCount: couponCount
				});
			}
		});

		self.cartApi.request();

		var isModifying = false;

		self.cartModifyApi = new api.CartModifyAPI({
			$el: self.$el,
			checkData: false,
			beforeSend: function () {
				isModifying = true;
			},
			success: function (res) {
				self.cartApi.reload();
			},
			error: function (res) {
				Toast.showToast(res.msg);

				self.getModel('data_baglist').find(function (item) {
					return item.SPB_ID == self.modifySpbId;

				}).set({
					SPB_QTY: this.originQty
				});

				this.$input.val(this.originQty);
			},
			complete: function () {
				isModifying = false;
				this.hideLoading();
			}
		});

		this.initWithDeletion();
	},

	checkAll: function () {
		this.getModel("data_baglist").each(function (mod) {
			mod.set({
				checked: true
			});
		});

		this.getModel("data_package").each(function (mod) {
			mod.set({
				checked: true
			});
		})
	},

	viewWillUpdate: function () {
		if (this.data.isEdit) {
			var selectedCount = 0;

			if (this.data.data_baglist) {
				this.data.data_baglist.concat(this.data.data_package || []).forEach(function (item) {
					if (item.checked) {
						selectedCount++;
					}
				});
			}

			if (this.data.selectedCount !== selectedCount) {
				this.set({
					selectedCount: selectedCount
				})
			}
		}
	},

	initWithDeletion: function () {
		var self = this;

		new Deletion({
			el: self.$el,
			children: '.js_delete_item',
			width: 70,
			events: {
				'.js_delete': function (e) {
					self.del(e);
				}
			}
		});

		self.cartDeleteApi = new api.CartDeleteAPI({
			$el: self.$el,
			checkData: false,
			params: {
				pspcode: self.user.PSP_CODE
			},
			success: util.noop,
			error: function (res) {
				Toast.showToast(res.msg);
			}
		});

		self.cartDeletePackageAPI = new api.CartDeletePackageAPI({
			$el: self.$el,
			checkData: false,
			params: {
				pspcode: self.user.PSP_CODE
			},
			success: function (res) {
				self.cartApi.reload();
			},
			error: function (res) {
				Toast.showToast(res.msg);
			}
		});
	},

	del: function (e) {
		var self = this;

		popup.confirm({
			title: '温馨提示', content: '确认要移除该商品吗?',
			cancelAction: function () {
			},
			cancelText: '不删除',
			confirmAction: function () {
				this.hide();

				var $target = $(e.currentTarget);
				var id = $target.data('id');

				if (id) {
					self.getModel('data_baglist').remove(function (item) {
						return item.SPB_ID == id;
					});

					self.cartDeleteApi.setParam({
						spbId: id

					}).request(function () {
						self.cartApi.reload();
					});

				} else {
					self.cartDeletePackageAPI.setParam({
						wacid: $target.data('wacid'),
						ppgid: $target.data('ppgid'),
						groupid: $target.data('groupid')

					}).load();
				}
			},
			confirmText: '确认删除'
		})
	},

	getPrice: function (bag_amount, coupon, Points) {
		var couponPrice = coupon && coupon.VCA_DEDUCT_AMOUNT ? coupon.VCA_DEDUCT_AMOUNT : 0;
		if (coupon && coupon.VCT_ID == 5) {
			couponPrice = 0;
		}
		return Math.max(0, bag_amount - couponPrice - (Points / 100));
	},

	getFreight: function (bag_amount, coupon, Points, freecouponcode) {
		var price = this.getPrice(bag_amount, coupon, Points);
		var freight = ((self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || price >= 99 || freecouponcode) ? 0 : 15);

		return price >= 99 ? "免邮费" : ('¥' + Math.round(freight * 100) / 100);
	},

	getTotal: function (bag_amount, coupon, Points, freecouponcode) {

		if (util.isTrue(this.data.data_baglist) || util.isTrue(this.data.data_package)) {

			var couponPrice = coupon && coupon.VCA_DEDUCT_AMOUNT ? coupon.VCA_DEDUCT_AMOUNT : 0;
			var total;
			var price;
			var freight;

			if (coupon && coupon.VCT_ID == 5) {
				price = Math.max(0, bag_amount - couponPrice - (Points / 100));
				freight = ((self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || bag_amount - (Points / 100) >= 99 || freecouponcode) ? 0 : 15);
				total = Math.max(0, bag_amount + freight - couponPrice - (Points / 100));

			} else {
				price = Math.max(0, bag_amount - couponPrice - (Points / 100));
				total = price + ((self.user.XPS_CTG_ID && self.user.XPS_CTG_ID >= 4 || price >= 99 || freecouponcode) ? 0 : 15);
			}

			return '¥' + (Math.round(total * 100) / 100);

		} else {
			return '¥0';
		}

	},

	changeQty: function (item, qty, e) {

		console.log(item, qty, e);

		var origin = parseInt(item.SPB_QTY);
		qty = parseInt(qty);
		if (!qty || isNaN(qty) || qty == origin) {
			return;
		}
		this.modifySpbId = item.SPB_ID;

		$.extend(this.cartModifyApi, {
			originQty: origin,
			$input: $(e.currentTarget)

		}).setParam({
			pspcode: this.user.PSP_CODE,
			spbId: item.SPB_ID,
			qty: qty
		}).load();
	},

	usePoint: function (points) {
		if (!points) {
			this.set({
				isShowPoint: false,
				Points: 0
			});
			return;
		}
		points = parseFloat(points);
		if (points > this.user.Points) {
			Toast.showToast('您输入的数值已超过您的积分最大值，请重新输入');
			return;
		}
		else if (points < 100 || points % 100 != 0) {
			Toast.showToast('您输入的数值不是100的倍数，请重新输入');
			return;
		}

		this.set({
			isShowPoint: false,
			Points: points
		});
	},

	useCoupon: function (coupon) {
		if (coupon.VCT_ID == 1 && coupon.VCA_MIN_AMOUNT > self.data.bag_amount) {
			Toast.showToast('您的购物金额满' + coupon.VCA_MIN_AMOUNT + '元才可使用哦');
			return;
		}

		if (coupon.VCT_ID == 4) {
			this.set({
				freecouponcode: this.data.freecouponcode && this.data.freecouponcode.CSV_CODE == coupon.CSV_CODE
					? null
					: coupon
			});

		} else if (coupon.VCT_ID == 5) {
			var usedCoupons = this.data.usedCoupons || [];
			var index = util.indexOf(usedCoupons, function (item) {
				return item.CSV_CODE == coupon.CSV_CODE;
			});

			if (index != -1) {
				usedCoupons.splice(index, 1);
			} else {
				usedCoupons.push(coupon);
			}

			var codes = [];
			var amount = 0;
			usedCoupons.forEach(function (item) {
				codes.push(item.CSV_CODE);
				amount += item.VCA_DEDUCT_AMOUNT;
			});

			this.set({
				usedCoupons: usedCoupons,
				couponcode: {
					VCT_ID: 5,
					VCA_DEDUCT_AMOUNT: amount,
					CSV_CODE: codes.join(',')
				}
			});

		} else {
			this.set({
				usedCoupons: [],
				couponcode: this.data.couponcode && this.data.couponcode.CSV_CODE == coupon.CSV_CODE
					? null
					: coupon
			})
		}

		this.set({
			isShowCoupon: false
		});
	},

	submit: function () {
		var self = this;

		if (this.data.isEdit) {
			if (this.data.selectedCount == 0) {
				Toast.showToast('未选择要删除的商品');

			} else {
				var count = 0;
				var apis = [];

				if (this.data.data_baglist) {
					this.data.data_baglist.forEach(function (item) {
						if (item.checked) {
							apis.push(new api.CartDeleteAPI({
								checkData: false,
								params: {
									pspcode: self.user.PSP_CODE,
									spbId: item.SPB_ID
								},
								success: util.noop,
								error: util.noop
							}));
							count++;
						}
					});
				}
				if (this.data.data_package) {
					this.data.data_package.forEach(function (item) {
						if (item.checked) {
							apis.push(new api.CartDeletePackageAPI({
								checkData: false,
								params: {
									pspcode: self.user.PSP_CODE,
									wacid: item.SPB_WAC_ID,
									groupid: item.SPB_GROUP,
									ppgid: item.PPG_ID
								},
								success: util.noop,
								error: util.noop
							}));

							count++;
						}
					});
				}

				if (count != 0) {
					apis.forEach(function (item) {

						item.request(function () {

							count--;
							if (count == 0) {
								self.cartApi.reload();
							}
						});
					})
				}
			}

		} else {

			Application.forward('/buy')

		}
	},


	el: <div class="sp_cart">
		<div class="main">
			<ul class="sp_cart__list">
				<li sn-repeat="item in data_baglist|filter:!isEdit" class="sp_cart__listitem" data-id="{item.SPB_ID}">
					<div class="sp_cart__listitem_con js_delete_item">
						<img sn-src="{item.ProductOBJ.WPP_LIST_PIC}" data-forward="{item.SPB_WAC_ID==10?'/group/'+item.SPB_GROUP:('/item/'+item.PRD_ID)}" />
						<div class="con">
							<b class="name">{ item.PRD_NAME }</b>
							<p class="size">尺寸：{ item.PRD_SPEC.split('|')[0]} 颜色：{ item.PRD_COLOR }</p>
							<p class="price">￥{ Math.round(item.SPB_AMOUNT * 100) / 100 }</p>
						</div>
						<div class="ft">
							<p class="qty">x{item.SPB_QTY}</p>
						</div>
					</div>
					<i class="js_delete" data-id="{item.SPB_ID}"></i>
				</li>
				<li sn-repeat="item in data_baglist|filter:isEdit" class="sp_cart__listitem_mod sp_cart__listitem_con" data-id="{item.SPB_ID}">
					<div class="{item.checked?'radio checked':'radio'}" sn-tap="item.checked=!item.checked"></div>
					<img sn-src="{item.ProductOBJ.WPP_LIST_PIC}"  sn-tap="item.checked=!item.checked"/>
					<div class="con">
						<p class="qty">
							<span class="minus" sn-tap="this.changeQty(item,Math.max(!item.SPB_QTY?1:(parseInt(item.SPB_QTY)-1),1))">-</span>
							<input type="text" value="{item.SPB_QTY||1}"  />
							<span class="plus" sn-tap="this.changeQty(item,(parseInt(item.SPB_QTY)||1)+1)">+</span>
						</p>
						<p class="size">尺寸：{item.PRD_SPEC.split('|')[0]} 颜色：{ item.PRD_COLOR }</p>
					</div>
					<div class="ft">
						<p class="js_delete" data-id="{item.SPB_ID}" sn-tap="this.del()"></p>
					</div>
				</li>
			</ul>

			<div sn-repeat="ppg in data_package" class="sp_cart__pkgitem">
				<dl class="js_delete_item">
					<dt class="sp_cart__pkgitem_hd bottom_border">
						<div sn-if="{isEdit}" class="{ppg.checked?'radio checked':'radio'}" sn-tap="ppg.checked=!ppg.checked"></div>
						{ ppg.PPG_NAME }
						<b class="price">￥{ Math.round(ppg.PPG_PRICE * 100) / 100 }</b>
					</dt>
					<dd sn-repeat="item in ppg.PackageList" class="sp_cart__listitem bottom_border">
						<div class="sp_cart__listitem_con">
							<img sn-src="{item.PRD_PIC}" data-back="/item/{item.PRD_ID}" />
							<div class="con">
								<b class="name">{ item.PRD_NAME }</b>
								<p class="size">尺寸：{ item.PRD_SPEC.split('|')[0]} 颜色：{ item.PRD_COLOR }</p>
								<p class="price">￥{ Math.round(item.PRD_MEMBER_PRICE * (item.SPB_QTY || 1) * 100) / 100 }</p>
							</div>
							<div class="ft">
								<p class="qty">x{item.SPB_QTY}</p>
							</div>
						</div>
					</dd>
				</dl>
				<i class="js_delete sp_cart__delete" data-wacid="{ppg.SPB_WAC_ID}" data-groupid="{ppg.SPB_GROUP}" data-ppgid="{ppg.PPG_ID}" sn-tap="this.del()"></i>
			</div>

			<div class="my_nodata" sn-if="{!loading&&util.isFalse(data_baglist)&&util.isFalse(data_package)}" style="display:none">
				<div class="icon"></div>
				<div class="text">您的购物车内还没有商品</div>
				<div class="btn" data-back="/?tab=0">去逛逛吧</div>
			</div>
		</div>
		<div class="sp_cart__ft" sn-if="total">
			<div sn-if="{isEdit}" class="{selectedCount==data_baglist.length+data_package.length?'radio checked':'radio'}" sn-tap="this.checkAll()"></div>
			<div class="left">
				<div class="selectall" sn-if="{isEdit}">全选（{selectedCount}）</div>
				<div sn-if="{!isEdit}" class="num">共{total}件商品</div>
			</div>
			<div class="total" sn-if="{!isEdit}">
				合计 <em class="color">¥{bag_amount}</em></div>
			<button class="btn_l" sn-tap="this.submit()">{isEdit ? '批量删除' : '结算'}</button>
		</div>
	</div>
});

module.exports = Cart;