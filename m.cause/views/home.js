var $ = require('$');
var util = require('util');
var Activity = require('activity');
var bridge = require('bridge');
var Loading = require('../widget/loading');
var vm = require('core/model');
var Slider = require('../widget/slider');
var animation = require('animation');
var Confirm = require("components/confirm");
var api = require("models/api");
var ViewModel = vm.ViewModel;
var State = vm.State;


module.exports = Activity.extend({
    events: {},

    onCreate: function () {
        var self = this;

        var model = self.model = new vm.ViewModel(this.$el, {
            title: '缘起之因'
        });

        this.bindScrollTo(this.$('.main'));
        this.bindScrollTo(model.refs.interest, {
            vScroll: false,
            hScroll: true
        });

        model.changeTab = function (e, tab) {
            this.set({
                tab: tab
            })
        }

        this.shakeMsg();

        var slider = new Slider({
            container: model.refs.topbanner,
            loop: true,
            data: [{
                src: 'http://pic2.pedaily.cn/201604/20160420@137756.jpg',
                url: ''
            }, {
                    src: 'http://pic2.pedaily.cn/201604/20160421@137950.jpg',
                    url: ''
                }]
        });

    },

    onLoad: function () {

    },

    onShow: function () {
        var self = this;
    },

    onPause: function () {
    },

    onDestroy: function () {
    },

    //消息图标抖一抖
    shakeMsg: function () {
        var model = this.model;

        State.set({
            msgCount: 1
        })

        setInterval(function () {
            if (State.data.msgCount > 0) {
                var anims = 1;

                setTimeout(function (params) {
                    var rotate;

                    if (anims < 10) {
                        rotate = 'rotate(' + (anims % 2 == 0 ? '-' : '') + '5deg)'
                        setTimeout(arguments.callee, 50);
                    } else {
                        rotate = 'rotate(0deg)'
                    }

                    anims++;

                    $(model.refs.msg).css({
                        transform: rotate
                    });

                }, 50);
            }

        }, 6000);
    }

});
