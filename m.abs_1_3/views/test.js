var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model');
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

        seajs.use('views/test3', function (test3) {

            var res = test3.css_beautify("   .bd    \n { padding-top: 4px/$p; ul { display: -webkit-box;\n margin-top: 5px; }\n\
        li { -webkit-box-flex: 1; width: 0px; height: 80px; text-align: center; font-size: 14px; &:before { @include icon(0px, 0px, 104px/$p, 104px/$p, \"icon_share.png\", block); background-size: 416px/$p auto; margin: 0 auto 4px auto; }\
            }\n//asdfsf\n/*爱管家\nasdf*/\n\
        @for $i from 1 to 4 { li:nth-child(#{$i+1}):before { background-position: -104px/$p*$i 0px; }\
            }\n\n\
        }\n\
        \
        \
        \
ss\n\n\n\
        \
    .ft { .btn { display: block; line-height: 30px; height: 60px/$p; width: (550/640)*100%; font-size: 16px; background: #ccc; margin: 5px auto 0 auto; border-radius: 0;   }\
        }\
        \
    }");
            console.log(res);

            //$main.html(res);

        });



        var now = Date.now();
        console.log(now);

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

        console.log(Date.now() - now)

    },

    onShow: function () {
        var self = this;
    },

    onDestory: function () {
    }
});
