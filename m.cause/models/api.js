var Loading = require('widget/loading');

var UpdateAPI = Loading.extend({
    url: '/app/getversion',
    baseUri: $('meta[name="update-api-base-url"]').attr('content')
});
exports.UpdateAPI = UpdateAPI;

var API = Loading.extend({
    baseUri: $('meta[name="api-base-url"]').attr('content')
});
exports.API = API;

exports.OrderStatusAPI = API.extend({
    url: '/api/user/get_order_status',
    checkData: false,
    check: false,
    params: {
        id: 0
    }
});

exports.OrderAPI = API.extend({
    url: '/api/order/get',
    checkData: false,
    check: false,
    params: {
        orderId: 0
    }
});

exports.CouponStatusAPI = API.extend({
    url: '/api/user/get_coupon_status',
    checkData: false,
    check: false,
    params: {
        id: 0
    }
});

var ShopAPI = Loading.extend({
    baseUri: $('meta[name="shop-api-base-url"]').attr('content'),
    KEY_PAGE: 'currentpage'
});
exports.ShopAPI = ShopAPI;


exports.NewsAPI = ShopAPI.extend({
    url: '/api/prod/getedm',
    checkData: false,
    params: {
        id: 0
    }
});

exports.AddressListAPI = ShopAPI.extend({
    url: '/api/user/addresslist',
    params: {
        pspcode: 0
    }
});

exports.EditAddressAPI = ShopAPI.extend({
    url: '/api/user/editaddress',
    params: {
        pspcode: 0,
        edittype: 2,//编辑类型：1.新增 2.修改
        mbaId: 0,
        mbaName: '',
        mbaMobile: 0,
        mbaCtyId: 0,
        mbaDefault: false,
        mbaRegId: 0,
        mbaAddress: ''
    }
});

exports.DeleteAddressAPI = ShopAPI.extend({
    url: '/api/user/deladdress',
    params: {
        pspcode: 0,
        mbaId: 0
    }
});

exports.ProvinceAPI = ShopAPI.extend({
    url: '/api/user/prvlist'
});

exports.CityAPI = ShopAPI.extend({
    url: '/api/user/ctylist',
    params: {
        prvId: 0
    }
});

exports.RegionAPI = ShopAPI.extend({
    url: '/api/user/reglist',
    params: {
        ctyId: 0
    }
});

exports.CouponAPI = ShopAPI.extend({
    url: '/api/user/GetCoupon',
    params: {
        pspcode: '',
        csvcode: ''
    }
});

//获取购物车可用优惠券
exports.AvailableCouponAPI = ShopAPI.extend({
    url: '/api/prod/availablecoupon',
    params: {
        pspcode: ''
    }
});

exports.GetSharedCouponAPI = API.extend({
    url: '/api/user/get_shared_coupon',
    params: {
        UserID: 0,
        Auth: '',
        data: ''
    }
});

exports.CouponUserAPI = API.extend({
    url: '/api/user/get_coupon_user',
    params: {
        data: ''
    }
});

exports.CreateOrderAPI = ShopAPI.extend({
    url: '/api/shop/CreateMOrder',
    params: {
        pspcode: '',
        mba_id: 1, //（用户收货地址）,
        pay_type: 1, //（支付方式  RPayType 具体id到时候定）,
        coupon: '', //（优惠券券号）,
        points: 0, //(积分数 100抵1块钱)
        freecoupon: ''//（免邮券券号）
    }
});

//分类列表
exports.CategoryAPI = ShopAPI.extend({
    url: '/api/prod/pcglist'
});

exports.SubCategoryAPI = ShopAPI.extend({
    url: '/api/prod/pcgitem',
    params: {
        id: 0 //父类ID
    }
});

exports.ProductSearchAPI = ShopAPI.extend({
    url: "/Prod/productlist",
    params: {
        keycodes: '',
        orderbyStr: 2,
        orderby: 'desc',
        length: 2,
        pages: 0
    }
});

exports.ProductHeadAPI = ShopAPI.extend({
    url: '/api/prod/prhitem',
    params: {
        id: 0
    }
});

exports.ProductAPI = ShopAPI.extend({
    url: '/api/prod/prditem',
    params: {
        id: 0
    }
});

exports.ProductColorAndSpec = ShopAPI.extend({
    url: "/api/prod/getsizebyprh",
    params: {
        id: 0
    }
});

exports.ProductDetailAPI = ShopAPI.extend({
    url: '/api/prod/prddetail',
    params: {
        id: 0
    }
});

exports.ProductListAPI = ShopAPI.extend({
    url: '/api/prod/pcgprd',
    params: {
        pcgid: 0 //父类ID
    }
});

exports.NewProductAPI = ShopAPI.extend({
    url: '/api/prod/newproductlist',
    params: {
        length: 100,
        pages: 0
    }
});

exports.ActivityAPI = ShopAPI.extend({
    url: '/Prod/GetApiBannerPrd',
    params: {
        h5name: 'api_prod1'
    }
});

exports.CartAPI = ShopAPI.extend({
    url: '/api/shop/bag',
    params: {
        pspcode: 0
    }
});

exports.CartQtyAPI = ShopAPI.extend({
    url: '/api/shop/bagqty',
    params: {
        pspcode: 0
    }
});

exports.CartAddAPI = ShopAPI.extend({
    url: '/api/shop/addbag',
    params: {
        pspcode: 0,
        prd: 0,
        qty: 1
    }
});

exports.CartModifyAPI = ShopAPI.extend({
    url: '/api/shop/SaveProductChangeRow',
    params: {
        pspcode: 0,
        spbId: 0,
        qty: 1
    }
});

exports.CartDeleteAPI = ShopAPI.extend({
    url: '/api/shop/deletebag',
    params: {
        pspcode: 0,
        spbId: 0
    }
});

exports.CartDeletePackageAPI = ShopAPI.extend({
    url: '/api/shop/deletepackagebag',
    params: {
        pspcode: 0,
        wacid: 0,
        ppgid: 0,
        groupid: 0
    }
});

exports.CancelOrderAPI = ShopAPI.extend({
    url: '/shop/cancelOrder',
    params: {
        pspcode: '',
        purcode: ''
    }
});

exports.OrderCreateAPI = ShopAPI.extend({
    url: '/api/shop/CreateMOrder',
    params: {
        pspcode: '',
        mba_id: 0,
        pay_type: 1,
        coupon: '',
        points: 0,
        freecoupon: ''
    }
});

exports.OrderShareAPI = ShopAPI.extend({
    url: '/api/prod/shareactivity'
});

exports.AddShareAPI = ShopAPI.extend({
    url: '/api/prod/addshare',
    params: {
        pspcode: ''
    }
});

exports.WxPayAPI = API.extend({
    url: '/api/shop/wxpayqrcode',
    checkData: false,
    params: {
        order_no: ''
    }
});

exports.StewardListAPI = ShopAPI.extend({
    url: '/api/steward/list',
    params: {
        pspid: 0
    }
});

exports.StewardQtyAPI = ShopAPI.extend({
    url: '/api/steward/stewardqty',
    params: {
        pspcode: ''
    }
});

exports.StewardAPI = ShopAPI.extend({
    url: '/api/steward/item',
    params: {
        prh_id: 0
    }
});

exports.StewardDetailAPI = ShopAPI.extend({
    url: '/api/steward/detail',
    params: {
        detail_id: 0
    }
});

exports.MonthAPI = ShopAPI.extend({
    url: '/api/prod/freeskulist',
    params: {
        freid: 2
    }
});


exports.MonthProductAPI = ShopAPI.extend({
    url: '/api/prod/ajaxactprdlist',
    params: {
        pages: 1,
        len: 6
    }
});

exports.FastBuyAPI = ShopAPI.extend({
    url: '/api/prod/flashprodlist',
    params: {
        startdt: '2015-01-01',
        enddt: '2016-01-01'
    }
});

exports.PackageAPI = ShopAPI.extend({
    url: '/api/prod/getpackage',
    params: {
        id: 0
    }
});

exports.PackageCartAPI = ShopAPI.extend({
    url: '/api/prod/addpackagebag',
    params: {
        pspcode: '',
        prdIds: '',
        ppgId: ''
    }
});

exports.PackageRelativeAPI = ShopAPI.extend({
    url: '/api/prod/getppginfo',
    params: {
        prdId: ''
    }
});

exports.DiscoverTypeAPI = ShopAPI.extend({
    url: '/api/discover/discovertype'
});

exports.DiscoverListAPI = ShopAPI.extend({
    url: '/api/discover/discoverlist',
    params: {
        currentpage: 1,
        pageSize: 10,
        dctid: 0
    }
});

exports.RecDiscoveryAPI = ShopAPI.extend({
    url: '/api/discover/recdiscovery'
});

exports.DiscoveryAPI = ShopAPI.extend({
    url: '/api/discover/discover',
    params: {
        id: 0
    }
});

exports.DiscoveryAddShareAPI = ShopAPI.extend({
    url: '/api/discover/addshare',
    checkData: false,
    params: {
        pspcode: '',
        dcvid: 0
    }
});

exports.DiscoveryFavAPI = ShopAPI.extend({
    url: '/api/discover/addlikes',
    checkData: false,
    params: {
        pspcode: '',
        dcvid: 0
    }
});

exports.DiscoveryRemoveFavAPI = ShopAPI.extend({
    url: '/api/discover/removelikes',
    checkData: false,
    params: {
        pspcode: '',
        dcvid: 0
    }
});

exports.AppShareActivityAPI = ShopAPI.extend({
    url: '/api/discover/appshareactivity',
    checkData: false,
    params: {
        id: 0
    }
});

exports.AddActivityCouponAPI = ShopAPI.extend({
    url: '/api/discover/addcashvoucher',
    checkData: false,
    params: {
        pspcode: '',
        vca_id: 20
    }
});

exports.AppIconAPI = ShopAPI.extend({
    url: '/system/getappicon',
    checkData: false,
    params: {
        id: 2
    }
});
