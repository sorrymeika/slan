var $ = require('$');
var util = require('util');
var model = require('core/model2');

var optionHeight = 20;

util.style('.calendar.curr{z-index:5001;width:280px;}.calendar{height:22px;padding:1px;zoom:1;display:inline-block;*display:inline;position:relative;overflow:visible;z-index:0;color:#000;width:280px;}\
        .calendar span {cursor:pointer;border:0;margin:0;padding:0 2px;height:20px;line-height:20px;display:inline-block;position:relative;color:#000;background-color:#f1f1f1;}\
        .calendar-icon{margin-top: 0px;display: inline-block;vertical-align: middle;position: relative;font-size: 12px;width: 10px;height: 8px;overflow: hidden;line-height: 12px;font-family: "SimSun";}\
        .calendar-icon em {display: inline-block;height: 0px;overflow: hidden;position: absolute;top: 0px;left: 0px;  border-top: 4px solid #000;border-right: 4px solid #fff;border-left: 4px solid #fff;}\
        .calendar-up .calendar-icon em {border-top: 4px solid #fff;border-bottom: 4px solid #000;}\
        .calendar-up,.calendar-down {cursor:pointer;}\
        .calendar-wrap {top:0;left:0;position:absolute;border:1px solid #cdcdcd;background:#fff;overflow:hidden;}\
        .calendar-bd {width:35px;text-align:center;float:left;}\
        .calendar-bd i { display: block; height: ' + optionHeight + 'px;font-style:normal; cursor: default; }\
        .calendar-con{height:200px;overflow:hidden;}\
        .calendar-bd i.curr { background: #ddd; }');

var TimePicker = model.ViewModel.extend({
    el: <div class="calendar{isShow?' curr':''}" >
        <div sn-click="this.show()">
            <span><em>{ yyyy }</em></span> /
            <span><em>{ util.pad(MM) }</em></span> /
            <span><em>{ util.pad(dd) }</em></span>
            <span><em>{ util.pad(hh) }</em></span>&nbsp;:
            <span><em>{ util.pad(mm) }</em></span>&nbsp;:
            <span><em>{ util.pad(ss) }</em></span>
        </div>
        <div class="calendar-wrap" sn-display="{isShow}" style="display:none;">
            <div class="calendar-bd">
                <div class="calendar-up" sn-click="yearIndex=(yearIndex>0?yearIndex-1:yearIndex)"><em class="calendar-icon"><em></em></em></div>
                <div class="calendar-con"><div style="margin-top:-{parseInt(yearIndex*200)}px"><i sn-repeat="item in years" class="{yyyy==item?'curr':''}" sn-click="this.setYear(item)">{ item }</i></div></div>
                <div class="calendar-down" sn-click="yearIndex=years.length>(yearIndex+1)*10?yearIndex+1:yearIndex"><em class="calendar-icon"><em></em></em></div>
                <i sn-click="this.today()">今天</i>
            </div>
            <div class="calendar-bd">
                <div class="calendar-up" sn-click="monthIndex=(monthIndex>0?monthIndex-1:monthIndex)"><em class="calendar-icon"><em></em></em></div>
                <div class="calendar-con"><div style="margin-top:-{parseInt(monthIndex*200)}px"><i sn-repeat="item in months" class="{MM==item?'curr':''}" sn-click="this.setMonth(item)">{ util.pad(item) }</i></div></div>
                <div class="calendar-down" sn-click="monthIndex=months.length>(monthIndex+1)*10?monthIndex+1:monthIndex"><em class="calendar-icon"><em></em></em></div>
                <i sn-click="this.now()">现在</i>
            </div>
            <div class="calendar-bd">
                <div class="calendar-up" sn-click="dayIndex=(dayIndex>0?dayIndex-1:dayIndex)"><em class="calendar-icon"><em></em></em></div>
                <div class="calendar-con"><div style="margin-top:-{parseInt(dayIndex*200)}px"><i sn-repeat="item in days" class="{dd==item?'curr':''}" sn-click="this.setDay(item)">{ util.pad(item) }</i></div></div>
                <div class="calendar-down" sn-click="dayIndex=days.length>(dayIndex+1)*10?dayIndex+1:dayIndex"><em class="calendar-icon"><em></em></em></div>
                <i sn-click="this.clearInput()">清空</i>
            </div>

            <div class="calendar-bd">
                <div class="calendar-up" sn-click="hourIndex=(hourIndex>0?hourIndex-1:hourIndex)"><em class="calendar-icon"><em></em></em></div>
                <div class="calendar-con"><div style="margin-top:-{parseInt(hourIndex*200)}px"><i sn-repeat="item in hours" class="{hh==item?'curr':''}" sn-click="this.setHours(item)">{ util.pad(item) }</i></div></div>
                <div class="calendar-down" sn-click="hourIndex=years.length>(hourIndex+1)*10?hourIndex+1:hourIndex"><em class="calendar-icon"><em></em></em></div>
            </div>
            <div class="calendar-bd">
                <div class="calendar-up" sn-click="minuteIndex=(minuteIndex>0?minuteIndex-1:minuteIndex)"><em class="calendar-icon"><em></em></em></div>
                <div class="calendar-con"><div style="margin-top:-{parseInt(minuteIndex*200)}px"><i sn-repeat="item in minutes" class="{mm==item?'curr':''}" sn-click="this.setMinutes(item)">{ util.pad(item) }</i></div></div>
                <div class="calendar-down" sn-click="minuteIndex=months.length>(minuteIndex+1)*10?minuteIndex+1:minuteIndex"><em class="calendar-icon"><em></em></em></div>
            </div>
            <div class="calendar-bd">
                <div class="calendar-up" sn-click="secondIndex=(secondIndex>0?secondIndex-1:secondIndex)"><em class="calendar-icon"><em></em></em></div>
                <div class="calendar-con"><div style="margin-top:-{parseInt(secondIndex*200)}px"><i sn-repeat="item in seconds" class="{ss==item?'curr':''}" sn-click="this.setSeconds(item)">{ util.pad(item) }</i></div></div>
                <div class="calendar-down" sn-click="secondIndex=days.length>(secondIndex+1)*10?secondIndex+1:secondIndex"><em class="calendar-icon"><em></em></em></div>
                <i class="js_hide">确定</i>
            </div>
        </div>
    </div>,

    constructor: function ($input, options) {
        var now = new Date();
        var self = this;

        console.log('asdfasf');

        options = $.extend({
            yearFrom: now.getFullYear() - 30,
            yearTo: now.getFullYear() + 5
        }, options);

        this.$input = $input;

        this.aDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        var years = [];
        for (var i = options.yearFrom; i <= options.yearTo; i++) {
            years.push(i);
        }
        var months = [];
        for (var i = 1; i <= 12; i++) {
            months.push(i);
        }

        var hours = [];
        for (var i = 0; i <= 23; i++) {
            hours.push(i);
        }

        var minutes = [];
        var seconds = [];
        for (var i = 0; i <= 59; i++) {
            minutes.push(i);
            seconds.push(i);
        }

        model.ViewModel.call(this, {
            yyyy: '----',
            MM: '--',
            dd: '--',
            hh: '--',
            mm: '--',
            ss: '--',
            yearIndex: 0,
            monthIndex: 0,
            dayIndex: 0,
            hourIndex: 0,
            minuteIndex: 0,
            secondIndex: 0,

            years: years,
            months: months,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        });

        this.$el.insertBefore($input);
    },

    setYear: function (e, year) {
        var update;
        if (typeof e === 'number') {
            update = year;
            year = e;
        }
        this.set({
            yyyy: year,
            yearIndex: parseInt(this.data.years.indexOf(year) / 10)
        });

        return this._syncDays()._update(update);
    },

    setMonth: function (e, month) {
        var update;
        if (typeof e === 'number') {
            update = month;
            month = e;
        }
        var index = this.data.months.indexOf(month);

        this.set({
            MM: month,
            monthIndex: parseInt(index / 10),
        });

        return this._syncDays()._update(update);
    },

    setDay: function (e, day) {
        var update
        if (typeof e === 'number') {
            update = day;
            day = e;
        }

        return this.set({
            dd: day,
            dayIndex: parseInt(this.data.days.indexOf(day) / 10),
        })._update(update);
    },

    setHours: function (e, num) {
        var update
        if (typeof e === 'number') {
            update = num;
            num = e;
        }

        return this.set({
            hh: num,
            hourIndex: parseInt(this.data.hours.indexOf(num) / 10),
        })._update(update);
    },

    setMinutes: function (e, num) {
        var update
        if (typeof e === 'number') {
            update = num;
            num = e;
        }

        return this.set({
            mm: num,
            minuteIndex: parseInt(this.data.minutes.indexOf(num) / 10),
        })._update(update);
    },

    setSeconds: function (e, num) {
        var update
        if (typeof e === 'number') {
            update = num;
            num = e;
        }

        return this.set({
            ss: num,
            secondIndex: parseInt(this.data.seconds.indexOf(num) / 10),
        })._update(update);
    },

    _syncDays: function () {

        var days = [];
        var index = this.data.months.indexOf(this.data.MM);
        var year = parseInt(this.data.yyyy) || 0;
        if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) {
            this.aDays[1] = 29;
        } else {
            this.aDays[1] = 28;
        }
        var mDays = this.aDays[index];

        for (var i = 1; i <= mDays; i++) {
            days.push(i);
        }

        return this.set({
            dayIndex: 1,
            days: days
        });
    },

    today: function () {
        var now = new Date();

        return this.setYear(now.getFullYear())
            .setMonth(now.getMonth() + 1)
            .setDay(now.getDate());
    },

    now: function () {
        var now = new Date();

        return this.setTime(now);
    },

    setTime: function (time) {
        if (!time) {
            return this.clearInput();
        }
        if (typeof time == 'number' || (typeof time == 'string' && /^\d+$/.test(time))) {
            time = new Date(time);
        } else if (typeof time == 'string') {
            time = Date.parse();
        }

        return this.setYear(time.getFullYear(), false)
            .setMonth(time.getMonth() + 1, false)
            .setDay(time.getDate(), false)
            .setHours(time.getHours(), false)
            .setMinutes(time.getMinutes(), false)
            .setSeconds(time.getSeconds(), false)
            ._update();
    },

    clearInput: function () {

        return this.set({
            yyyy: '----',
            MM: '--',
            dd: '--',
            hh: '--',
            mm: '--',
            ss: '--'
        })._update();
    },

    _update: function (isUpdate) {
        if (isUpdate !== false) {
            var data = this.data;
            var time = data.yyyy != '----'
                ? (data.yyyy + '/' + data.MM + '/' + data.dd).replace(/--/g, '1') + ' ' + (data.hh + ':' + data.mm + ':' + data.ss).replace(/--/g, '00')
                : '';

            if (time != this.$input.val())
                this.$input.val(time).trigger('onTimeChange');
        }
        return this;
    },

    getTime: function () {
        return Date.parse(this.$input.val().replace(/-/g, '/')) || 0;
    },

    show: function () {
        var self = this;

        $(document.body).on('mouseup', function (e) {
            if (self.$el.has(e.target).length == 0 || $(e.target).hasClass('js_hide')) {
                self.hide();
                $(this).off('mouseup', arguments.callee);
            }
        });

        return this.set({
            isShow: true
        });
    },

    hide: function () {
        this.set({
            isShow: false
        });
    },

    val: function (time) {
        this.setTime(time);
    }
})

module.exports = TimePicker;
