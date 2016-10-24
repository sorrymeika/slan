var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var ONES = {
    heduohao: '和多号'
}

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var type = this.route.params.type;

        var model = this.model = new Model(this.$el, {
            setting: {
                enable_push: true,
                enable_mcpush: true,
                enable_apppush: true,
                enable_smspush: true,
                enable_pushsound: false
            },
            title: ONES[type] || '系统设置'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        Promise.all([this.waitLoad()]).then(function (results) {

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
