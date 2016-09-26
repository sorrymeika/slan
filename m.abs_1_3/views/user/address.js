var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loader');
var model = require('core/model');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require('models/api');
var Deletion = require("components/deletion");

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        },
        'tap .js_add_address': function () {
            this.forward('/addaddress?from=' + encodeURIComponent(this.route.url) + "&buy=" + (this.route.query.buy || ''));
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.user = util.store('user');

        self.swipeRightBackAction = self.route.query.from || '/';

        Scroll.bind($main);

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '收货地址'
        });

        self.model.forward = function (e, id) {
            var address = util.first(self.model.get('data'), function (item) {
                return item.AddressID == id;
            });

            util.store('address', address);
            self.forward('/addaddress?edittype=2&from=' + encodeURIComponent(self.route.url) + '&id=' + id + "&buy=" + (self.route.query.buy || ''));
        }

        self.address = new api.AddressListAPI({
            $el: this.$el,
            params: {
                pspcode: self.user.PSP_CODE
            },
            success: function (res) {
                res.data.sort(function (a, b) {
                    return a.AddressID > b.AddressID ? 1 : a.AddressID < b.AddressID ? -1 : 0;
                });

                console.log(res.data);

                self.model.set({
                    data: res.data
                });
            }
        });

        self.deleteAddressApi = new api.DeleteAddressAPI({
            $el: this.$el,
            params: {
                pspcode: self.user.PSP_CODE
            },
            checkData: false,
            success: function (res) {
                var id = this.params.mbaId;

                self.model.getModel("data").remove(function (item) {
                    return id == item.AddressID;
                });
            },
            error: function (res) {
                sl.tip(res.msg);
            }
        })

        new Deletion({
            el: self.model.refs.addressList,
            children: '.js_delete_item',
            width: 70,
            events: {
                '.js_delete': function (e) {
                    var $target = $(e.currentTarget);
                    var id = $target.data('id');

                    console.log(id);

                    self.deleteAddressApi.setParam({
                        mbaId: id

                    }).load();
                }
            }
        });
    },

    onShow: function () {
        var self = this;
        self.address.load();
    },

    onDestory: function () {
    }
});
