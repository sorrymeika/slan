var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model');
var model2 = require('core/model2');
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

        model2.Global.set({
            title: 'sssss',

            list: [{
                name: 'global.test.0'
            }, {
                    name: 'global.test.1'
                }]
        })

        setTimeout(function () {
            model2.Global.set({
                title: 'aaaa'
            });

        }, 1000);

        var m = new model2.ViewModel(this.$el, {

            list: [{
                name: 'list.test.0'
            }, {
                    name: 'list.test.1'
                }],

            data: [{
                name: '1234',
                children: [{
                    name: 'aaa'
                }]
            }, {
                    name: '2234',
                    children: [{
                        name: 'bbb'
                    }]
                }]
        });

        m.test = function (a, e) {
            console.log(a, e);
        }

        return;

        console.time('test');
        console.profile('test');

        var data = {
            back: self.swipeRightBackAction,
            title: '标题',
            data: [{
                name: '1234',
                children: [{
                    name: 'aaa'
                }]
            }],
            children: []
        };

        for (var i = 0; i < 10; i++) {
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

        self.model = new model.ViewModel(this.$el, {});

        self.model.set(data);

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

        self.model.set(data);

        console.timeEnd('test');
        console.profileEnd('test');

    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
