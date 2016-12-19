var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var quan = require('logical/quan');

module.exports = Activity.extend({

    onCreate: function() {
        var self = this;
        var type = this.type = this.route.params.type;

        var model = this.model = new Model(this.$el, {
            title: type == 1 ? '不看他（她）的朋友圈' : '不让他（她）看我的朋友圈'
        });

        model.back = function() {
            self.back(self.swipeRightBackAction)
        }

        model.del = function(item) {
            model._('data').remove('friend_id', item.friend_id);
        }

        model.selectUser = function() {
            self.forward('/quan/select_user', {
                type: type,

                onSelect: function(data) {
                    console.log(data);
                    var list = model.get('data');
                    var appends = [];

                    data.forEach(function(item) {
                        var flag = false;
                        for (var i = 0, len = list.length; i < len; i++) {
                            var selected = list[i];
                            if (selected.user_id == item.friend_id) {
                                flag = true;
                                break;
                            }
                        }

                        if (!flag) {

                            appends.push({
                                friend_id: item.friend_id,
                                user_name: item.user_name,
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

        Promise.all([quan.getQuanBlack(type), this.waitLoad()]).then(function(results) {
            var res = results[0];

            model.set('data', res.data || []);

            self.bindScrollTo(model.refs.main);

        }).catch(function(e) {
            Toast.showToast(e.message);

        }).then(function() {
            loader.hideLoading();
        });
    },

    onShow: function() {
        var self = this;
    },

    onDestroy: function() {
        this.model.destroy();
    },

    add: function() {
        var loader = this.loader;

    }
});