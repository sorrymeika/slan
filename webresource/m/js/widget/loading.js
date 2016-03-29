define(function (require, exports, module) {
    var $ = require('$'),
        _ = require('util'),
        app = require('bridge');

    var extend = ['$el', 'url', 'method', 'headers', 'dataType', 'xhrFields', 'beforeSend', 'success', 'complete', 'pageIndex', 'pageSize', 'append', 'checkData', 'check', 'hasData', 'KEY_PAGE', 'KEY_PAGESIZE', 'DATAKEY_TOTAL', 'MSG_NO_MORE'];

    var Loading = function (options) {
        $.extend(this, _.pick(options, extend));

        if (options.el)
            this.$el = $(options.el);
        !this.$el && (this.$el=$());
        this.el = this.$el[0];

        this.params = $.extend({}, this.params, options.params);
        this.error = options.error || this.showError;
        this.$scroll = options.$scroll || this.$el;
        this.$content = options.$content || this.$scroll;
        this.pageEnabled = !!(options.pageEnabled || this.append);
        options.showLoading != undefined && (this.isShowLoading = options.showLoading !== false);

        this.setUrl(this.url);
    }

    Loading.prototype = {
        isShowLoading: true,

        KEY_PAGE: 'page',
        KEY_PAGESIZE: 'pageSize',

        DATAKEY_MSG: 'msg',
        DATAKEY_TOTAL: 'total',
        DATAKEY_PAGENUM: '',

        MSG_NO_MORE: '没有更多数据了',
        MSG_LOADING_MORE: '正在加载...',

        baseUri: $('meta[name="api-base-url"]').attr('content'),
        method: "POST",
        dataType: 'json',

        pageIndex: 1,
        pageSize: 10,

        template: '<div class="dataloading"></div>',
        refresh: '<div class="refreshing"><p class="loading js_loading"></p><p class="msg js_msg"></p></div>',
        errorTemplate: '<div class="server_error"><i class="msg js_msg"></i><i class="ico_reload js_reload"></i></div>',

        check: function (res) {
            var flag = !!(res && res.success);
            return flag;
        },

        hasData: function (res) {
            return res.data && res.data.length;
        },

        showMoreLoading: function () {
            this.showMoreMsg(this.MSG_LOADING_MORE);
            this.$refreshing.find('.js_loading').show();
        },

        showMsg: function (msg) {
            if (this.pageIndex == 1) {
                this.$loading.find('.js_msg').show().html(msg);
                this.$loading.show().find('.js_loading').hide();
            } else {
                this.showMoreMsg(msg);
            }
        },

        showMoreMsg: function (msg) {
            var $refreshing = (this.$refreshing || (this.$refreshing = $(this.refresh)).appendTo(this.$content));

            $refreshing.find('.js_msg').show().html(msg);
            $refreshing.show().find('.js_loading').hide();
        },

        complete: _.noop,

        showError: function (option) {
            var that = this;

            if (this.pageIndex == 1) {

                that.$loading && this.$loading.animate({
                    opacity: 0
                }, 300, 'ease-out', function () {
                    that.$loading.hide().css({ opacity: '' });
                });

                var $error = (that.$error || (that.$error = $(that.errorTemplate).on('tap', '.js_reload', $.proxy(that.reload, that)).appendTo(that.$el)));

                if (typeof option == 'string') {
                    option = {
                        msg: option,
                        showReload: true
                    }
                }

                var $reload = $error.find('.js_reload');
                option.showReload ? $reload.show() : $reload.hide();

                $error.find('.js_msg').html(option.msg || '加载失败');
                $error.show();

            } else {
                that.showMsg('<div class="data-reload js_reload">加载失败，请点击重试<i class="i-refresh"></i></div>');
            }
        },

        showLoading: function () {
            var that = this,
                $refreshing;

            this.$error && this.$error.hide();

            if (that.pageIndex == 1) {
                if (!that.$loading) {
                    that.$loading = $(that.template);
                }
                that.$loading.show().appendTo(that.$el)[0].clientHeight;
                that.$loading.addClass('show');

                that.$refreshing && that.$refreshing.hide();

            } else {
                that.showMoreLoading();
                that.$loading && that.$loading.hide();
            }
        },

        hideLoading: function () {
            this.$error && this.$error.hide();
            this.$refreshing && this.$refreshing.hide();
            this.$loading.removeClass('show');
        },

        setHeaders: function (key, val) {
            var attrs;
            if (!val)
                attrs = key
            else
                (attrs = {})[key] = val;

            if (this.headers === undefined) this.headers = {};

            for (var attr in attrs) {
                this.headers[attr] = attrs[attr];
            }
            return this;
        },

        setParam: function (key, val) {
            var attrs;
            if (!val)
                attrs = key
            else
                (attrs = {})[key] = val;

            for (var attr in attrs) {
                val = attrs[attr];

                if (attr == this.KEY_PAGE)
                    this.pageIndex = val;
                else if (attr == this.KEY_PAGESIZE)
                    this.pageSize = val
                else
                    this.params[attr] = val;
            }
            return this;
        },

        getParam: function (key) {
            if (key) return this.params[key];
            return this.params;
        },

        setUrl: function (url) {
            this.url = /^http\:\/\//.test(url) ? url : (this.baseUri.replace(/\/$/, '') + '/' + url.replace(/^\//, ''));
            return this;
        },

        reload: function (options, callback) {
            if (!this.isLoading) {
                this.pageIndex = 1;
                this.load(options, callback);
            }
        },

        load: function (options, callback) {
            var that = this;

            if (that.beforeSend && that.beforeSend() === false) return;

            if (that.isLoading) return;
            that.isLoading = true;

            if (typeof options == 'function') callback = options, options = null;
            if (that.pageEnabled) {
                that.params[that.KEY_PAGE] = that.pageIndex;
                that.params[that.KEY_PAGESIZE] = that.pageSize;
            }

            if (options && options.showLoading !== undefined)
                that.isShowLoading = options.showLoading;

            that.isShowLoading && that.showLoading();

            that._xhr = $.ajax({
                url: that.url,
                headers: that.headers,
                xhrFields: that.xhrFields,
                data: that.params,
                type: that.method,
                dataType: that.dataType,
                cache: false,
                error: function (xhr) {
                    that.isShowLoading && that.hideLoading();

                    var res = {};
                    res[that.DATAKEY_MSG] = '网络错误'
                    that.error(res, xhr);
                    callback && callback.call(that, res, null);
                },
                success: function (res, status, xhr) {
                    that.isShowLoading && that.hideLoading();

                    if (!that.check || that.check(res)) {

                        if (that.checkData === false || that.hasData(res)) {
                            if (that.pageIndex == 1 || !that.append) that.success(res, status, xhr);
                            else that.append(res, status, xhr);

                            callback && callback.call(that, null, res);

                            if (that.append) that.checkAutoRefreshing(res);

                        } else {
                            that.dataNotFound(res);
                        }
                    } else {
                        that.error(res);
                        callback && callback.call(that, res, null);
                    }
                },
                complete: function () {
                    that._xhr = null;
                    that.isLoading = false;
                    that.complete();
                }
            });

            return that;
        },

        _refresh: function () {
            this.abort().load();
        },

        dataNotFound: function (e, res) {
            var that = this;

            if (that.pageIndex == 1) {
                that.showError('暂无数据');
            } else {
                setTimeout(function () {
                    that.$refreshing.hide()

                }, 3000);
            }
        },

        _scroll: function (e, options) {
            var that = this;

            if (!that.isLoading && options.height + options.y + options.height / 2 >= options.scrollHeight) {
                //&& that._scrollY < y && y + that.$scroll.height() >= that.$refreshing[0].offsetTop

                that._refresh();
            }
        },

        _autoRefreshingEnabled: false,

        checkAutoRefreshing: function (res) {
            var that = this,
                data = that.params;

            if (that.append && ((that.DATAKEY_PAGENUM && res[that.DATAKEY_PAGENUM] && res[that.DATAKEY_PAGENUM] > data[that.KEY_PAGE]) || (that.DATAKEY_TOTAL && res[that.DATAKEY_TOTAL] && res[that.DATAKEY_TOTAL] > data[that.KEY_PAGE] * parseInt(data[that.KEY_PAGESIZE])))) {

                that.pageIndex++;
                that.enableAutoRefreshing();

            } else {
                that.disableAutoRefreshing();
            }
        },

        enableAutoRefreshing: function () {

            this.showMoreLoading('正在载入...');

            if (this._autoRefreshingEnabled) return;
            this._autoRefreshingEnabled = true;

            this.$scroll.on('scrollStop', $.proxy(this._scroll, this));

            if (this.el.scrollTop + this.$scroll.height() >= this.$refreshing[0].offsetTop) {
                this._refresh();
            }
        },

        disableAutoRefreshing: function () {
            if (!this._autoRefreshingEnabled) return;
            this._autoRefreshingEnabled = false;

            this.$scroll.off('scrollStop', this._scroll);

            this.showMoreMsg(this.MSG_NO_MORE);
        },

        abort: function () {
            if (this._xhr) {
                this.isLoad = false;
                this._xhr.abort();
                this._xhr = null;

                this.hideLoading();
            }
            return this;
        },

        destory: function () {
            this.abort();
            this.disableAutoRefreshing();
            this.$error && this.$error.off('tap', '.js_reload', this.reload);
        }
    };

    Loading.extend = _.extend;

    module.exports = Loading;
});
