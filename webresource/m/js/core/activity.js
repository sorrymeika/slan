
var util = require('util'),
    Event = require('./event'),
    Promise = require('promise'),
    Scroll = require('widget/scroll'),
    Component = require('./component'),
    bridge = require('bridge'),
    slice = Array.prototype.slice,
    indexOf = util.indexOf,
    getUrlPath = util.getPath;


var STATUS = {
    INIT: 0,
    CREATED: 1,
    SHOW: 2,
    PAUSE: 3,
    DESTORY: 4
}

function onDestroy(instance) {
    if (instance._scrolls) instance._scrolls.destroy();

    instance.onDestroy && instance.onDestroy();
    instance.application.remove(instance.url);
}

function onStatusChange(e) {

    switch (e.type) {
        case 'Show':
            if (this.status == STATUS.PAUSE) {
                this.trigger('Resume');
            }
            this.status = STATUS.SHOW;
            break;

        case 'Pause':
            this.status = STATUS.PAUSE;
            break;

        case 'Destroy':
            onDestroy(this);
            this.status = STATUS.DESTORY;
            break;
    }
}

var Activity = Component.extend({
    el: '<div class="view"></div>',

    toggleAnim: 'def',
    defBackUrl: '/',
    autosetBackUrl: true,
    status: STATUS.INIT,

    initialize: function (options) {
        var self = this;

        self.application = options.application;

        options.fuckMe(this);

        if (this.className) {
            this.className += ' view';
            this.$el.addClass('view');
        }

        self.on('Show Pause Destroy', onStatusChange);

        self.onAppear && self.on('Appear', self.onAppear);
        self.onShow && self.on('Show', self.onShow);
        self.onResume && self.on('Resume', self.onResume);
        self.onLoad && self.one('Show', self.onLoad);
        self.onHide && self.on('Hide', self.onHide);
        self.onPause && self.on('Pause', self.onPause);
        self.onQueryChange && self.on('QueryChange', self.onQueryChange);

        self._waitLoad = new Promise(function (resolve, reject) {
            self.one('Show', resolve);
        });

        if (!self.$el.data('path')) {
            self.$el.data('url', self.url).data('path', self.path);

            seajs.use(self.route.template, function (razor) {
                self.razor = razor;
                self.$el.html(razor.html(self.data)).appendTo(self.application.$el);

                self.onCreate();
            });

        } else {
            this.onCreate();
        }
    },

    bindScrollTo: function (el, options) {

        var sbr = Scroll.bind(el, options);

        if (!this._scrolls) {
            this._scrolls = sbr;

        } else {
            this._scrolls.add(sbr);
        }
        return sbr;
    },

    getScroll: function (el) {
        return this._scrolls.get(el);
    },

    onCreate: util.noop,

    //页面准备就绪，可加载数据
    onLoad: null,

    waitLoad: function (fn) {
        return typeof fn === 'function' ? this._waitLoad.then(fn) : this._waitLoad;
    },

    //进入动画结束时触发
    onShow: null,

    //离开动画开始时触发
    onPause: null,

    //离开动画结束时触发
    onHide: null,

    onResume: null,

    onStop: null,

    onQueryChange: null,

    onResult: function (event, fn) {
        return this.listenTo(this.application, event, fn);
    },

    setResult: function () {
        this.application.trigger.apply(this.application, arguments);
        return this;
    },

    compareUrl: function (url) {
        return getUrlPath(url) === this.route.path.toLowerCase();
    },

    forward: function (url, duration, toggleAnim, data) {
        this.application.forward(url, duration, toggleAnim, data);
        return this;
    },

    back: function (url, duration, toggleAnim, data) {
        this.application.back(url || this.swipeRightBackAction, duration, toggleAnim, data);
        return this;
    },

    replaceWith: function (url, duration) {
        this.application.replace(url, duration);
        return this;
    },

    queryString: function (key, val) {
        var query = this.route.query;

        if (typeof val === 'undefined')
            return query[key];

        if (query[key] == val) return;

        else if (val === null || val === false || val === '')
            delete query[key];
        else
            query[key] = val;

        var queryString = $.param(query);

        this.route.url = this.url = this.route.path + (queryString ? '?' + queryString : '');

        this.application.navigate(this.url);

        var data = {};
        data[key] = val;

        this.trigger(new Event('QueryChange', {
            data: data
        }));
    },

    isExiting: false,
    _startExiting: function () {
        var self = this;
        if (self.isExiting) return;
        self.isExiting = true;
        var application = self.application;
        if (application.activeInput) {
            application.activeInput.blur();
            application.activeInput = null;
        }
        application.mask.show();
    },

    _enterAnimationEnd: function () {
        var self = this;
        self.application.mask.hide();

        self.isExiting = false;

        self.$el.addClass('active');
        self.trigger('Show');
    }
});

module.exports = Activity;
