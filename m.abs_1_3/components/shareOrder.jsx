var $ = require('$');
var model = require('core/model2');
var Share = require('components/share');
var api = require('models/base');
var userModel = require('models/user');

var Month = model.ViewModel.extend({
    el: <div class="main"><div class="od_share">
        <h1>支付成功</h1>
        <h2>感谢在ABS购买商品</h2>
        <div class="con">
            <div html="{{data.SHA_MSG}}"></div>
            <div class="btn" sn-tap="this.showShare()">{{ data.SHA_BUTTON_TIPS }}</div>
        </div>
    </div></div>,

    showShare: function () {
        this.addShareAPI.load();
    },

    initialize: function () {
        var self = this;
        var orderShareAPI = new api.OrderShareAPI({
            $el: this.$el,
            checkData: false,
            success: function (res) {
                console.log(res);

                self.set({
                    data: res.data
                });

                self.share.set({
                    title: res.data.SHA_NAME
                });
            },
            error: function (res) {
                sl.tip(res.msg);
            }
        });

        self.share = new Share({
            head: '分享'
        });

        orderShareAPI.load();

        self.user = userModel.get();

        this.addShareAPI = new api.AddShareAPI({
            $el: this.$el,
            params: {
                pspcode: self.user.PSP_CODE,
                purid: self.data.id
            },
            checkData: false,
            success: function (res) {
                self.share.set({
                    linkURL: res.data,
                    description: ''
                });
                self.share.show();

            },
            error: function (res) {
                sl.tip(res.msg);
            }
        });

        self.share.callback = function (res) {
        }
        self.share.$el.appendTo(self.$el);
    }
});

module.exports = Month;