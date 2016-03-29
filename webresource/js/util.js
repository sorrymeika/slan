var ArrayProto = Array.prototype,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    ua = navigator.userAgent,
    ios = ua.match(/(iPhone|iPad|iPod).*OS\s([\d_]+)/i),
    ie = ua.match(/MSIE (\d+)/i),
    android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
    isAndroid = !!android,
    guid = 0,
    osVersion,
    nativeKeys = Object.keys

var hasOwnProperty = Object.prototype.hasOwnProperty;

if (ios) osVersion = ios[2].split('_');
else if (android) osVersion = android[2].split('.');
else if (ie) osVersion = ie[1].split('.');

var pad = function (num, n) {
    var a = '0000000000000000' + num;
    return a.substr(a.length - (n || 2));
};

var util = {
    isInApp: /SLApp/.test(ua),
    ios: !!ios,
    ie: !!ie,
    android: isAndroid,
    osVersion: osVersion ? parseFloat(osVersion[0] + '.' + osVersion[1]) : 0,
    isInWechat: /micromessenger/i.test(navigator.userAgent),
    combinePath: function () {
        var args = [].slice.apply(arguments);
        var result = args.join('/').replace(/[\\]+/g, '/').replace(/([^\:\/]|^)[\/]{2,}/g, '$1/').replace(/([^\.]|^)\.\//g, '$1');
        var flag = true;
        while (flag) {
            flag = false;
            result = result.replace(/([^\/]+)\/\.\.(\/|$)/g, function (match, name) {
                if (name == '..') return match;
                if (!flag) flag = true;
                return '';
            })
        }
        return result.replace(/\/$/, '');
    },
    guid: function () {
        return ++guid;
    },

    isFalse: function (value) {
        return !value || ($.isArray(value) && !value.length) || (typeof value == 'object' && util.isEmptyObject(value));
    },

    isTrue: function (value) {
        return !this.isFalse(value);
    },

    isEmptyObject: function (obj) {
        for (var name in obj) {
            return false;
        }
        return true;
    },

    keys: function (obj) {
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
        return keys;
    },

    extend: function (proto) {
        var parent = this,
            child = hasOwnProperty.call(proto, 'constructor') ? proto.constructor : function () {
                return parent.apply(this, arguments);
            };

        var Surrogate = function () { this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        for (var key in proto)
            child.prototype[key] = proto[key];

        for (var key in parent)
            child[key] = parent[key];

        child.__super__ = parent.prototype;

        return child;
    },

    random: function (min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    },

    log: function (msg) {
        if (!this.$log) {
            this.$log = $('<div style="height:40px;position:fixed;top:0;left:0;right:0;z-index:100000;background:#fff;overflow-y:scroll;word-break:break-all;word-wrap:break-word;"></div>').appendTo('body');
        }
        if (arguments.length > 1) {
            msg += ArrayProto.slice.call(arguments, 1).join(' ');
        }
        this.$log.html(msg + '<br>' + this.$log.html());
    },

    indexOf: function (arr, val) {
        var isFn = typeof val === 'function',
            length = arr.length;

        for (var i = 0; i < length; i++) {
            if (isFn ? val(arr[i], i) : (arr[i] == val)) return i;
        }
        return -1;
    },

    lastIndexOf: function (arr, val) {
        var isFn = typeof val === 'function';
        for (var i = arr.length - 1; i >= 0; i--) {
            if (isFn ? val(arr[i], i) : (arr[i] == val)) return i;
        }
        return -1;
    },

    first: function (arr, fn) {
        var item;

        for (var i = 0, len = arr.length; i < len; i++) {
            item = arr[i];

            if (fn(item, i)) return item;
        }
        return null;
    },

    find: function (arr, fn) {
        var result = [],
            item;

        for (var i = 0, n = arr.length; i < n; i++) {
            item = arr[i];

            if (fn(item, i))
                result.push(item);
        }
        return result;
    },

    select: function (arr, fn) {
        var result = [],
            length = arr.length;

        for (var i = 0; i < length; i++)
            result.push(fn(arr[i], i));

        return result;
    },

    pick: function (obj, iteratee) {
        var result = {}, key;
        if (obj == null) return result;
        if (typeof iteratee === 'function') {
            for (key in obj) {
                var value = obj[key];
                if (iteratee(value, key, obj)) result[key] = value;
            }
        } else {
            var keys = concat.apply([], slice.call(arguments, 1));
            for (var i = 0, length = keys.length; i < length; i++) {
                key = keys[i];
                if (key in obj) result[key] = obj[key];
            }
        }
        return result;
    },

    pad: pad,

    formatMoney: function (number) {
        return (number + '').replace(/(\d{3})+(\.|$)/, function (match, a) { return match.replace(/\d{3}/g, function (a) { return ',' + a }) }).replace(/^,/, '');
    },

    deepValue: function (data, names) {
        if (typeof names === 'string')
            names = names.split('.');

        for (var i = 0, len = names.length; i < len; i++) {
            data = data[names[i]];
        }

        return data;
    },

    format: function (format, str) {
        var args = arguments;
        return format.replace(/\{(\d+)\}/g, function (match, index) {
            return args[parseInt(index) + 1];
        })
    },

    formatDate: function (d, f) {
        if (typeof d === "string" && /^\/Date\(\d+\)\/$/.test(d)) {
            d = new Function("return new " + d.replace(/\//g, ''))();
        } else if (typeof d === 'number')
            d = new Date(d);
        else if (!d)
            return '';

        var y = d.getFullYear() + "", M = d.getMonth() + 1, D = d.getDate(), H = d.getHours(), m = d.getMinutes(), s = d.getSeconds(), mill = d.getMilliseconds() + "0000";
        return (f || 'yyyy-MM-dd HH:mm:ss').replace(/\y{4}/, y)
            .replace(/y{2}/, y.substr(2, 2))
            .replace(/M{2}/, pad(M))
            .replace(/M/, M)
            .replace(/d{2,}/, pad(D))
            .replace(/d/, d)
            .replace(/H{2,}/i, pad(H))
            .replace(/H/i, H)
            .replace(/m{2,}/, pad(m))
            .replace(/m/, m)
            .replace(/s{2,}/, pad(s))
            .replace(/s/, s)
            .replace(/f+/, function (w) {
                return mill.substr(0, w.length)
            })
    },

    style: function (css) {
        var doc = document,
            head = doc.getElementsByTagName("head")[0],
            style = doc.createElement("style");

        style.type = "text/css";
        try {
            style.appendChild(doc.createTextNode(css));
        } catch (ex) {
            style.styleSheet.cssText = css;
        }
        head.appendChild(style);

        return style;
    },

    currency: function (str, p) {
        return (p === undefined || p === null ? '￥' : p) + Math.round(parseFloat(str) * 100) / 100;
    },

    template: function (str, data) {
        var tmpl = 'var __p=[];var $data=obj||{};with($data){__p.push(\'' +
            str.replace(/\\/g, '\\\\')
                .replace(/'/g, '\\\'')
                .replace(/<%=([\s\S]+?)%>/g, function (match, code) {
                    return '\',' + code.replace(/\\'/, '\'') + ',\'';
                })
                .replace(/<%([\s\S]+?)%>/g, function (match, code) {
                    return '\');' + code.replace(/\\'/, '\'')
                        .replace(/[\r\n\t]/g, ' ') + '__p.push(\'';
                })
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n')
                .replace(/\t/g, '\\t') +
            '\');}return __p.join("");',

            func = new Function('obj', tmpl);

        return data ? func(data) : func;
    },

    encodeHTML: function (text) {
        return ("" + text).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&#34;").split("'").join("&#39;");
    },

    getPath: function (url) {
        return url.replace(/^http\:\/\/[^\/]+|\?.*$/g, '').toLowerCase();
    },

    cookie: function (a, b, c, p) {
        if (typeof b === 'undefined') {
            var res = document.cookie.match(new RegExp("(^| )" + a + "=([^;]*)(;|$)"));
            if (res != null)
                return unescape(res[2]);
            return null;
        } else {
            if (typeof b === null) {
                b = this.cookie(name);
                if (b != null) c = -1;
                else return;
            }
            if (c) {
                var d = new Date();
                d.setTime(d.getTime() + c * 24 * 60 * 60 * 1000);
                c = ";expires=" + d.toGMTString();
            }
            document.cookie = a + "=" + escape(b) + (c || "") + ";path=" + (p || '/')
        }
    },
    store: window.localStorage ? function (key, value) {
        if (typeof value === 'undefined')
            return JSON.parse(localStorage.getItem(key));
        if (value === null)
            localStorage.removeItem(key);
        else
            localStorage.setItem(key, JSON.stringify(value));
    } : function () {
        if (typeof value === 'undefined')
            return JSON.parse(this.cookie(key));
        if (value === null)
            this.cookie(key, null);
        else
            this.cookie(key, JSON.stringify(value));
    },
    noop: function () { },

    circlePoint: function (x0, y0, r, a) {
        return {
            x: x0 + r * Math.cos(a * Math.PI / 180),
            y: y0 + r * Math.sin(a * Math.PI / 180)
        };
    },

    validateEmail: function (email) {
        return /^[-_a-zA-Z0-9\.]+@([-_a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,3}$/.test(email)
    },
    validateMobile: function (str) {
        return /^1[0-9]{10}$/.test(str)
    }
};

module.exports = util;