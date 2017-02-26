var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loading = require('widget/loading');
var model = require('core/model');
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

        this.bindScrollTo($main);

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



        // $.ajax({
        //     type: 'POST',
        //     url: "http://bmsh.wxcs.cn/manage/notification/receiveWeibo",
        //     contentType: 'application/json',
        //     data: JSON.stringify({ "operation_in": { "content": { "request": { "request_time": "20161229163841714", "request_seq": "329503856438", "msisdn": "15705958061", "notify_type": "2", "notify": { "home_city": "592", "dun_type": "2", "useble_balance": "1970", "special_balance": "990", "unuseble_balance": "0", "pre_month_owing": "0", "this_month_owing": "0", "lagging": "0", "defer_cycle": "2", "defer_limit_amout": "10000" } } } } })
        // });


        /*
               var exists = function (i) {
                   console.log('exists', i);
                   return i <= 599 ? true : false;
               }
               setTimeout(function () {
                   userLogical.getLatestVersion();
               }, 1000);
       
               //二分法查找
               var length = 1003;
       
               var rangeStart = 1;
               var rangeEnd = length - 2;
               var cursor = parseInt((rangeEnd - rangeStart) / 2);
               var result = 0;
       
               while (true) {
       
                   if (!exists(cursor)) {
       
                       if (exists(--cursor)) {
                           result = cursor + 1;
                           break;
       
                       } else if (rangeStart == cursor) {
                           result = cursor;
                           break;
                       }
                       rangeEnd = cursor - 1;
       
                   } else {
                       if (!exists(++cursor)) {
                           result = cursor;
                           break;
       
                       } else if (cursor == rangeEnd) {
                           result = cursor;
                           break;
                       }
       
                       rangeStart = cursor + 1;
                   }
       
                   if (rangeEnd == rangeStart) {
                       console.log('match', rangeStart)
                       result = exists(rangeStart) ? rangeStart + 1 : rangeStart;
                       break;
       
                   } else if (rangeEnd < rangeStart) {
                       console.log('error', rangeStart, rangeEnd)
                       break;
                   }
       
                   cursor = rangeStart + parseInt((rangeEnd - rangeStart) / 2);
                   console.log("cursor:", rangeStart, rangeEnd, cursor)
       
                   if (cursor <= 0) {
                       console.log('error match')
                       break;
                   }
               }
       
               console.log(result, cursor);
               */

    },

    onShow: function () {
        var self = this;
    },

    onDestroy: function () {
    }
});
