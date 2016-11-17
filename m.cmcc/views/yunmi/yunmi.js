var $ = require('$');
var util = require('util');
var bridge = require('bridge');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var yunMiRules = require('components/yunMiRules');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '云米账户'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }

        model.seeRules = function () {
            popup.alert({
                className: 'ym_rules__popup',
                title: '云米规则',
                content: yunMiRules.rule,
                btn: '关闭',
                action: function () {
                }
            })
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([this.waitLoad()]).then(function (results) {

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });

        bridge.motion.start();

        this.motion = this.motion.bind(this);
        $(window).on('motion', this.motion);
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
        $(window).off('motion', this.motion);
        bridge.motion.stop();
    },

    motion: function () {

        this.model.set({
            shakeResult: true
        })
    }
});
