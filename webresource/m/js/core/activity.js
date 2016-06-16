define(function (require, exports, module) {

    var Page = require('./page'),
        util = require('util'),
        Scroll = require('widget/scroll'),
        bridge = require('bridge'),
        Dialog = require('widget/dialog'),
        slice = Array.prototype.slice;

    var Activity = Page.extend({
        toggleAnim: 'def',
        defBackUrl: '/',

        initialize: function () {
            this.on('Create', this.onHtmlLoad)
                .on('Start', this.onStart)
                .on('Show', this._onShow)
                .on('Destroy', this._onDestroy);

            Page.prototype.initialize.apply(this, arguments);
        },

        onHtmlLoad: function () {
            var that = this;

            if (that.swipeRightBackAction === undefined) {
                that.swipeRightBackAction = that.query.from || that.referrer || that.defBackUrl;
            }
            that._scrolls = Scroll.bind(that.$('.scrollview'));
            that._isShowed = false;
        },

        _onShow: function () {
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

        _onDestroy: function () {
            if (this._scrolls) this._scrolls.destory();
            this.application.remove(this.url);
        },

        isExiting: false,
        _startExit: function () {
            var that = this;
            if (that.isExiting) return;
            that.isExiting = true;
            var application = that.application;
            if (application.activeInput) {
                application.activeInput.blur();
                application.activeInput = null;
            }
            application.mask.show();
            that.$el.removeClass('active');
        },

        _enterAnimationEnd: function () {
            var that = this;
            that.application.mask.hide();

            that.isExiting = false;
            that.then(function () {
                that.$el.addClass('active');
                that.trigger('Show');
            });
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
            var that = this;
            var dialog = new Dialog(options);
            that.bindQueryAction(name, dialog, {
                show: 'show',
                "": 'hide'
            });
            return dialog;
        },

        forward: function (url, options) {
            this.application.forward(url, options);
        },

        back: function (url, options) {
            this.application.back(url, options);
        }
    });

    return Activity;
});
