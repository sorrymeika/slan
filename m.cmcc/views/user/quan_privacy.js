var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var quan = require('logical/quan');

var friendsModel = require('models/friends');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;
        var type = this.type = this.route.params.type;

        var model = this.model = new Model(this.$el, {
            title: type == 2 ? '不看他（她）的朋友圈' : '不让他（她）看我的朋友圈'
        });

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.del = function (item) {
            model._('data').remove('user_id', item.user_id);

            quan.deleteQuanBlack(item.black_id);
        }

        model.selectUser = function () {
            self.forward('/quan/select_user', {
                type: type,

                friends: model.get('data'),

                onSelect: function (data) {
                    console.log(data);
                    var list = model.get('data');
                    var appends = [];

                    data.forEach(function (item) {
                        var flag = false;
                        for (var i = 0, len = list.length; i < len; i++) {
                            var selected = list[i];
                            if (selected.user_id == item.user_id) {
                                flag = true;
                                break;
                            }
                        }

                        if (!flag) {

                            quan.addQuanBlack(item.user_id, type);

                            appends.push({
                                user_id: item.user_id,
                                user_name: friendsModel.getUserShowName(item),
                                avatars: item.avatars
                            });
                        }

                    });

                    model._('data').add(appends);
                }
            });
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        Promise.all([quan.getQuanBlack(type), this.waitLoad()]).then(function (results) {
            var res = results[0];

            var data = res.data || [];

            data.forEach(function (item) {
                item.user_id = item.friend_id;
            });

            console.log(data);

            model.set('data', data);

            res.friends && res.friends.forEach(function (friend) {
                model._('data').update({
                    user_id: friend.user_id,
                    avatars: friend.avatars,
                    user_name: friendsModel.getUserShowName(friend)

                }, 'user_id');
            });


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

    onDestroy: function () {
        this.model.destroy();
    },

    add: function () {
        var loader = this.loader;

    }
});