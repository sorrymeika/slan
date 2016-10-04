var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loader');
var model = require('core/model');
var Scroll = require('widget/scroll');
var api = require('models/api');
var userModel = require('models/user');

module.exports = Activity.extend({
    events: {
        'tap .js_back': function () {
            this.back(this.swipeRightBackAction);
        }
    },

    onCreate: function () {
        var self = this;

        self.model = new model.ViewModel(this.$el, {
            title: '跟踪物流'
        });

        Scroll.bind(self.model.refs.main);

        self.user = userModel.get();


        var expressApi = new api.ExpressAPI({
            $el: self.$el,
            success: function (res) {
                self.model.set({
                    data: res
                });
            },
            error: function () {
            }
        });

        expressApi.setParam({
            pur_code: self.route.params.code,
            pspcode: self.user.PSP_CODE

        }).load()
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
