var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: ''
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var photoViewer = this.photoViewer = new PhotoViewer();

        photoViewer.$el.appendTo(model.$el);

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([this.waitLoad()]).then(function (results) {

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
        var routeData = this.route.data;

        this.photoViewer.setImages(routeData.images);
    },

    onDestroy: function () {
        this.model.destroy();
    }
});
