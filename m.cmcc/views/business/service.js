var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var businessModel = require('models/business');


module.exports = Activity.extend({

    onCreate: function() {
        var self = this;

        console.log(businessModel.getGroups());

        var model = this.model = new Model(this.$el, {
            title: '服务大厅',
            group: businessModel.getGroups()
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([this.waitLoad()]).then(function(results) {


        }).catch(function(e) {
            Toast.showToast(e.message);

        }).then(function() {
            loader.hideLoading();
        });
    },

    onShow: function() {
        var self = this;
    },

    onDestory: function() {
        this.model.destroy();
    }
});