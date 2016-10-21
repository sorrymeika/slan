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

        var articleId = this.route.params.id;

        var model = this.model = new Model(this.$el, {
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        var commentsLoader = publicquan.createCommentsLoader({
            msg_id: articleId,
            $scroll: $(model.refs.main)

        }, function (res) {
            model.set({
                comments: res.data
            })

        }, function (res) {

            model.getModel('comments').add(res.data);
        });

        Promise.all([publicquan.article(articleId), commentsLoader.request().catch(function () { }), this.waitLoad()]).then(function (results) {
            model.set({
                data: results[0].data
            })

            self.bindScrollTo(model.refs.main);

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
        this.model.destroy();
    }
});
