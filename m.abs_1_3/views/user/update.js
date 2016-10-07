var $ = require('$');
var util = require('util');
var bridge = require('bridge');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;

var Toast = require('widget/toast');
var api = require('models/api');
var userModel = require('models/user');

var UpdateType = {
    userName: {
        key: 'UserName',
        title: '修改会员名'
    }
}

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var user = userModel.get();

        this.loader = new Loader({
            $el: this.$el
        });

        var props = UpdateType[this.route.params.type];

        var model = this.model = new Model(this.$el, Object.assign({
            text: user[props.key],
            origin: user[props.key]

        }, props));

        model.refs.text.focus();

        model.back = function () {
            self.back(self.swipeRightBackAction);
        }
    },

    onShow: function () {
        var self = this;
        var user = userModel.get();

        if (user) {
            this.model.set({
                src: user.Avatars
            })
        }
    },

    onDestory: function () {
    }
});
