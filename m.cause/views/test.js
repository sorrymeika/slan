var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model2');
var Scroll = require('widget/scroll');
var animation = require('animation');

module.exports = Activity.extend({
    events: {
        'tap .js_bind:not(.disabled)': function () {
        }
    },

    onCreate: function () {
        var self = this;
        var $main = self.$('.main');

        self.swipeRightBackAction = self.route.query.from || self.route.referrer || '/';

        Scroll.bind($main);

        var now = Date.now();
        console.log(now);

        var data = {
            data: [{
                name: '1234',
                children: [{
                    name: 'aaa'
                }]
            }],
            children: []
        };

        for (var i = 0; i < 100; i++) {
            data.data.push({
                name: 'nn' + i,
                children: [{
                    name: 'tt' + i
                }]
            });

            data.children.push({
                name: 'cc' + i,
                content: 'asdf',
                children: [{
                    name: 'bb' + i
                }, {
                        name: 'oo' + i
                    }]
            });
        }

        self.model = new model.ViewModel(this.$el, {
            back: self.swipeRightBackAction,
            title: '标题',
            data: [{ name: '' }]
        });

        self.model.set(data);

        console.log(Date.now() - now)

    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
