var $ = require('$');
var util = require('util');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');
var api = require("models/base");
var discoveryModel = require("models/discovery");
var userModel = require('models/user');
var Confirm = require('components/confirm');

module.exports = model.ViewModel.extend({
    el: <div class="discovery_index">
        <ul class="disc_nav">
            <li><p><em>全部ALL</em></p></li>
            <li sn-repeat="item in typeList"><p data-forward="/discovery/list/{{item.DCT_ID}}?name={{encodeURIComponent(item.DCT_DESC)}}"><em>{{ item.DCT_DESC }}</em><img src="{{item.DCT_PIC}}" /></p></li>
        </ul>
        <ul class="disc_list">
            <li sn-repeat="item in rec" data-forward="/discovery/{{item.DCV_ID}}">
                <img src="{{item.DCV_REC_PIC}}" />
                <p class="tit">{{ item.DCV_SUBTITLE }}</p>
                <p class="desc" sn-html="{{item.DCV_REC_CONTENT}}"></p>
            </li>
            <li sn-repeat="item in data" data-forward="/discovery/{{item.DCV_ID}}">
                <img src="{{item.DCV_SUBTITLE_PIC}}" />
                <em class="see">{{ item.DCV_VIEW_QTY }}</em>
                <em class="fav{{item.Like_Flag?' curr':''}}">{{ item.DCV_LIKE_QTY }}</em>
            </li>
        </ul>
    </div>,

    initialize: function () {
        var self = this;
        self.user = userModel.get();

        self.set({
            typeList: util.store('DiscoverType')
        });

        var discoverTypeAPI = new api.DiscoverTypeAPI({
            showLoading: false,

            success: function (res) {

                util.store('DiscoverType', res.data)

                self.set({
                    typeList: res.data
                });
            },

            error: function () {

            }
        });

        discoverTypeAPI.load();

        var recDiscoveryAPI = new api.RecDiscoveryAPI({
            showLoading: false,

            success: function (res) {
                console.log(res);

                self.set({
                    rec: res.data
                })
            },

            error: function () {
            }
        });

        recDiscoveryAPI.load();

        var discoverListAPI = new api.DiscoverListAPI({
            $el: self.$el,

            params: {
                pspcode: self.user.PSP_CODE
            },

            success: function (res) {

                discoveryModel.add(res.data);

                self.set({
                    data: res.data
                });
            },

            append: function (res) {
                if (res.data.length == 10) res.total = (this.pageIndex + 1) * parseInt(this.pageSize);

                self.model.getModel('data').add(res.data);
            },

            error: function () {
            }
        });

        discoverListAPI.load();

        //首次进入弹框
        if (!util.store("discovery_tip")) {

            new api.ShopAPI({
                url: '/api/discover/standtips',
                checkData: false,
                success: function (res) {

                    var confirm = new Confirm({
                        content: res.data

                    });
                    confirm.$el.appendTo($('body')).find('img').on('load', function () {
                        confirm.set({
                            height: 0
                        }).show();
                    });

                    confirm.show();
                    util.store("discovery_tip", sl.appVersion);
                },
                error: function (res) {

                }
            }).load();
        }

    }
});
