var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var contact = require('logical/contact');


module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var type = this.route.query.type;
        var personId = this.route.params.id;

        var model = this.model = new Model(this.$el, {
            title: '详细资料',
            personId: personId
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.deleteFriend = function () {

            popup.confirm({
                title: '温馨提示',
                comfirmText: '确定要删除吗？',
                confirmAction: function () {
                    this.hide();

                    contact.deleteFriend(personId);
                }
            })

        }

        model.toMemo = function () {
            self.forward('/contact/memo/' + personId, {
                memo: this.get('ext.memo')
            })
        }

        self.onResult("friendMemoChange:" + personId, function (e, memo) {
            model.set('ext.memo', memo);
        });


        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([contact.friend(personId), this.waitLoad()]).then(function (results) {
            var res = results[0];
            model.set({
                person: res.data,
                ext: res.ext,
                friend: res.friend
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
