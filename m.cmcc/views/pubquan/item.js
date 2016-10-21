var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var publicquan = require('logical/publicquan');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var quanId = this.route.params.id;

        var model = this.model = new Model(this.$el, {
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        Promise.all([publicquan.item(quanId), publicquan.newArticles(), this.waitLoad()]).then(function (results) {

            model.set({
                quanInfo: results[0].data,
                newArticles: results[1].data
            })

            self.mainScroll = self.bindScrollTo(model.refs.main);

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
