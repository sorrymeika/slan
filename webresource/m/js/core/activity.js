define(function (require, exports, module) {

    var util = require('util'),
        Promise = require('./promise'),
        Scroll = require('widget/scroll'),
        Component = require('./component'),
        bridge = require('bridge'),
        Dialog = require('widget/dialog'),
        slice = Array.prototype.slice,
        indexOf = util.indexOf,
        getUrlPath = util.getPath;

    var Activity = Component.extend({
        el: '<div class="view"></div>',

        toggleAnim: 'def',
        defBackUrl: '/',

        _referrer: function (route) {
            this.isForward = route.isForward;

            if (route.isForward) {
                var currActivity,
                    prevRoute = route,
                    prevActivity = this;

                while ((currActivity = prevRoute.prevActivity) && (prevActivity = currActivity.route.prevActivity) && prevRoute) {
                    if (prevActivity == this) {
                        currActivity.route.prevActivity = this.route.prevActivity;
                        currActivity.referrer = currActivity.route.referrer = this.referrer;
                        currActivity.referrerDir = currActivity.route.referrerDir = this.referrerDir;
                        currActivity.swipeRightBackAction = this.swipeRightBackAction;
                        break;
                    }
                    prevRoute = prevActivity.route;
                }

                this.referrer = route.referrer;
                this.referrerDir = route.referrerDir;

                console.log(this.referrer);
            }

            if (!this.swipeActionDisabled) {
                backUrl = route.query.from || this.referrer || this.defBackUrl;

                getUrlPath(backUrl) != route.path.toLowerCase() && (this.swipeRightBackAction = backUrl);
            }
            return this;
        },

        _setRoute: function (route) {
            var backUrl;

            this.route = route;
            this.hash = route.hash;
            this.url = route.url;
            this.path = route.path;
            this._query = this.query;
            this.query = $.extend({}, route.query);

            return this;
        },

        initialize: function () {
            var self = this,
                promise = Promise.resolve();

            self._promise = promise;
            self.className = self.el.className;

            self.application = self.options.application;

            self._referrer(self.options.route)
                ._setRoute(self.options.route)
                .on('Create', self.onHtmlLoad)
                .on('Show', self._onShow)
                .on('Destroy', self._onDestroy)
                .on('Pause', self._statusChange)
                .on('QueryChange', self.checkQuery);

            self.onStart && self.on('Start', self.onStart);
            self.onResume && self.on('Resume', self.onResume);
            self.onShow && self.on('Show', self.onShow);
            self.onPause && self.on('Pause', self.onPause);
            self.onQueryChange && self.on('QueryChange', self.onQueryChange);

            if (!self.$el.data('path')) {
                self.$el.data('url', self.url).data('path', self.path);
                promise.then(self.loadTemplate, self);
            }

            promise.then(self.onCreate, self)
                .then(function () {
                    self.checkQuery();
                });
        },

        loadTemplate: function () {

            var self = this,
                count = 1,
                callback = function () {
                    count--;
                    if (count == 0) {
                        self.$el.html(self.razor.html(self.data)).appendTo(self.application.$el);
                        self.trigger("Create");
                        self._promise.resolve();
                    }
                };

            if (self.route.api) {
                count++;
                $.ajax({
                    url: self.route.api,
                    type: 'GET',
                    dataType: 'json',
                    success: function (res) {
                        self.data = res;
                        callback(res);
                    },
                    error: function (xhr) {
                        callback({ success: false, content: xhr.responseText });
                    }
                });
            }

            seajs.use(self.route.template, function (razor) {
                self.razor = razor;
                callback();
            });

            return self._promise;
        },

        onCreate: util.noop,

        onHtmlLoad: function () {
            var self = this;

            self._scrolls = Scroll.bind(self.$('.scrollview'));
            self._isShowed = false;
        },

        onStart: null,

        //进入动画结束时触发
        onShow: null,

        _onShow: function (e) {
            this._statusChange(e);

            this.onLoad && this.onLoad();
            if (!this._isShowed) {
                this.trigger('Start');
            }

            if (!this._isShowed || this.isForward) {
                this.trigger('Enter');
                this.onEnter && this.onEnter();
            }
            this._isShowed = true;
        },

        //离开动画结束时触发
        onPause: null,

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

        _onDestroy: function () {
            if (this._scrolls) this._scrolls.destory();
            this.application.remove(this.url);
        },

        _statusChange: function (e) {
            if (this._status == 'Pause') {
                this.trigger('Resume');
            }
            this._status = e.type;
        },

        compareUrl: function (url) {
            return getUrlPath(url) === this.route.path.toLowerCase();
        },

        then: function (fn) {
            this._promise.then(fn, this);
            return this;
        },

        forward: function (url, options) {
            this.application.forward(url, options);
        },

        back: function (url, options) {
            this.application.back(url, options);
        },

        queryString: function (key, val) {
            if (typeof val === 'undefined')
                return this.route.query[key];

            else if (val === null || val === false || val === '')
                delete this.route.query[key];
            else
                this.route.query[key] = val || '';

            var query = $.param(this.route.query);

            this.application.navigate(this.route.path + (query ? '?' + query : ''));
        },

        _queryActions: {},
        checkQuery: function () {
            var self = this;
            var query = self.query;
            var prevQueries = self._query;
            var actionName;

            $.each(self._queryActions, function (name, option) {
                actionName = query[name] || '';

                if ((actionName && !prevQueries) || (prevQueries && actionName != prevQueries[name])) {
                    var action = option.map[actionName];
                    if (!action.exec) {
                        action.fn.apply(option.ctx);
                    } else {
                        action.exec = false;
                    }
                }
            });
        },

        bindQueryAction: function (name, ctx, fnMap) {
            var self = this;
            var newFn;
            var map = {};
            var option = {
                ctx: ctx,
                map: map
            };

            $.each(fnMap, function (key, functionName) {
                var functionName = fnMap[key];
                var fn = ctx[functionName];
                var action = {
                    fn: fn,
                    exec: false
                };

                map[key] = action;

                ctx[functionName] = function () {
                    fn.apply(ctx, arguments);

                    if (self.queryString(name) != key) {
                        action.exec = true;
                        self.queryString(name, key);
                    }
                }
            });

            this._queryActions[name] = option;
            return this;
        },


        createIFrame: function ($container) {
            var $iframe = $('<iframe width="' + window.innerWidth + 'px" frameborder="0" />').appendTo($container);
            var iframeWin = $iframe[0].contentWindow;
            var iframeDoc = iframeWin.document;
            var self = this;

            $(iframeDoc.body).on('click', 'a[href]', function (e) {
                var target = $(e.currentTarget);
                var href = target.attr('href');

                if (!/^(http\:|https\:|javascript\:|mailto\:|tel\:)/.test(href)) {
                    e.preventDefault();
                    if (!/^#/.test(href)) href = '#' + href;

                    target.attr('back') != null ? self.back(href) : self.forward(href);

                } else if (sl.isInApp && href.indexOf('http') == 0) {
                    bridge.openInApp(href);
                }
                return false;
            });

            return {
                $el: $iframe,
                window: iframeWin,
                document: iframeDoc,
                html: function (content) {

                    iframeDoc.body.innerHTML = '<style>p{ padding:0;margin:0 0 10px 0; }img{width:100%;height:auto;display:block;}</style>' + content;

                    $iframe.css({ height: iframeDoc.documentElement.scrollHeight });

                    [].forEach.call(iframeDoc.querySelectorAll('img'), function (img) {
                        img.style.width = "100%";
                        img.style.height = "auto";
                        img.onload = function () {
                            $iframe.css({ height: iframeDoc.documentElement.scrollHeight });
                        }
                    })
                }
            }
        },

        prompt: function (title, val, fn) {
            fn = typeof val === 'function' ? val : fn;
            val = typeof val === 'function' ? '' : val;
            var prompt = this._prompt;

            if (!prompt) {
                this._prompt = prompt = this.createDialog('prompt', {
                    top: '50%',
                    content: '<input type="text" class="prompt-text" />',
                    buttons: [{
                        text: '取消',
                        click: function () {
                            this.hide();
                        }
                    }, {
                            text: '确认',
                            click: function () {
                                this.hide();
                                this.ok && this.ok(this.$input.val());
                            }
                        }]
                });
                prompt.$input = prompt.$('.prompt-text');
            }

            prompt.title(title || '请输入').show();
            prompt.$input.val(val).focus();
            prompt.ok = $.proxy(fn, this);
        },

        confirm: function (title, content, fn) {
            if (typeof content === 'function') fn = content, content = title, title = '提示';
            var confirm = this._confirm;

            if (!confirm) {
                this._confirm = confirm = this.createDialog("confirm", {
                    buttons: [{
                        text: '取消',
                        click: function () {
                            this.hide();
                        }
                    }, {
                            text: '确认',
                            click: function () {
                                this.hide();
                                this.ok && this.ok();
                            }
                        }]
                });
            }

            confirm.title(title).show();
            confirm.content(content);
            confirm.ok = $.proxy(fn, this);
        },

        createDialog: function (name, options) {
            var self = this;
            var dialog = new Dialog(options);
            self.bindQueryAction(name, dialog, {
                show: 'show',
                "": 'hide'
            });
            return dialog;
        },

        isExiting: false,
        _startExit: function () {
            var self = this;
            if (self.isExiting) return;
            self.isExiting = true;
            var application = self.application;
            if (application.activeInput) {
                application.activeInput.blur();
                application.activeInput = null;
            }
            application.mask.show();
            self.$el.removeClass('active');
        },

        _enterAnimationEnd: function () {
            var self = this;
            self.application.mask.hide();

            self.isExiting = false;
            self.then(function () {
                self.$el.addClass('active');
                self.trigger('Show');
            });
        }
    });

    return Activity;
});
