var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var business = require('../../logical/business');
var businessModel = require('../../models/business');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var business_id = this.route.params.business_id;
        var businessItem = businessModel.find(business_id);

        var data = businessItem.get();
        var switcher = data.switcher || '1111100000';

        this.business_id = business_id;
        this.businessItem = businessItem;

        var model = this.model = new Model(this.$el, {
            switcher: switcher,
            title: data.business_name + '设置'
        });

        model.delegate = this;

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }
    },

    onShow: function () {
        var self = this;
    },

    setSwitcher: function (type) {
        var self = this;
        var model = this.model;
        var switcher = model.get('switcher');
        var curr = switcher.charAt(type);

        var prefix = switcher.substr(0, type);
        var suffix = switcher.substr(type + 1);

        switcher = prefix + (curr === '1' ? '0' : '1') + suffix;

        business.setBussnessSetting(this.business_id, switcher)
            .then(function () {
                self.businessItem.set({
                    switcher: switcher
                });
                model.set({
                    switcher: switcher
                })
            });
    },

    onDestroy: function () {
        this.model.destroy();
    }
});
