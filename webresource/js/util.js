var ArrayProto = Array.prototype,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    ua = typeof navigator == 'undefined' ? '' : navigator.userAgent,
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


var RE_QUERY_ATTR = /([_a-zA-Z0-9]+)(\^|\*|\=|\!|\$|\~)?\=(\d+|null|true|false|'(?:\\'|[^'])*'|"(?:\\"|[^"])*"|(?:.*?(?=[,\|&])))([,\|&])?/g;

function matchObject(queryGroups, obj) {

    var result = true;
    var flag;
    var val;
    var group;

    if (queryGroups) {

        for (var i = 0, length = queryGroups.length; i < length; i++) {
            group = queryGroups[i];
            result = true;

            for (var j = 0, n = group.length; j < n; j++) {
                item = group[j];
                val = obj[item.attr];

                switch (item.op) {
                    case '=':
                        result = val === item.val;
                        break;
                    case '!':
                        result = val != item.val;
                        break;
                    case '^':
                        result = val && (val.slice(0, item.val.length) == item.val);
                        break;
                    case '$':
                        result = val && (val.slice(-item.val.length) == item.val);
                        break;
                    case '*':
                        result = val && val.indexOf(item.val) != -1;
                        break;
                    case '~':
                        result = item.val !== null && item.val !== undefined
                            ? val && val.toLowerCase().indexOf(('' + item.val).toLowerCase()) != -1 : true;
                        break;
                    default:
                        result = val == item.val;
                        break;
                }

                if (!result) {
                    if (item.lg == '&') {
                        break;
                    }

                } else {

                    if (item.lg == '|') {
                        break;
                    }

                }
            }

            if (!result)
                break;
        }
    }
    return result;
}

//@query="attr^='somevalue'|c1=1,att2=2"
function compileQuery(query) {
    var group = [];
    var groups = [group];

    query.replace(RE_QUERY_ATTR, function (match, attr, op, val, lg) {
        //console.log(match, attr, op, val, lg);

        if (val.charAt(0) == '\'' && val.slice(-1) == '\'') {
            val = val.slice(1, -1).replace(/\\\'/g, '\'');
        } else {
            val = JSON.parse(val);
        }

        group.push({
            attr: attr,
            op: op,
            val: val,
            lg: lg
        });

        if (lg == ',') {
            groups.push(group = []);
        }
    });

    return groups[0].length > 0 ? function (obj) {

        return matchObject(groups, obj);

    } : function () { return true; };
}

function equals(a, b, identical) {
    if (identical ? a === b : a == b) return true;

    var typeA = toString.call(a);
    var typeB = toString.call(b);

    if (typeA !== typeB) return false;

    switch (typeA) {
        case '[object Object]':
            var keysA = Object.keys(a);

            if (keysA.length != Object.keys(b).length) {
                return false;
            }
            var key;

            for (var i = keysA.length; i >= 0; i--) {
                key = keysA[i];

                if (!equals(a[key], b[key], identical)) return false;
            }
            break;

        case '[object Array]':
            if (a.length != b.length) {
                return true;
            }

            for (var i = a.length; i >= 0; i--) {
                if (!equals(a[i], b[i], identical)) return false;
            }
            break;

        case '[object Date]':
            return +a == +b;

        case '[object RegExp]':
            return ('' + a) === ('' + b);

        default:
            if (identical ? a !== b : a != b) return false;
    }

    return true;
}

function contains(parent, obj) {
    var typeA = toString.call(parent);

    switch (typeA) {
        case '[object Object]':
            var keys = Object.keys(obj);

            for (var i = keys.length; i >= 0; i--) {
                var key = keys[i];

                if (obj[key] != parent[key]) return false;
            }
            break;

        case '[object Array]':
            if (!Array.isArray(obj)) return parent.indexOf(obj[i]) != -1;

            for (var i = obj.length; i >= 0; i--) {
                if (parent.indexOf(obj[i]) == -1) return false;
            }
            break;

        default:
            return obj == parent;
    }
    return true;
}

var util = {

    isInApp: /SLApp/.test(ua),
    ios: !!ios,
    iOS: !!ios,
    ie: !!ie,
    android: isAndroid,
    osVersion: osVersion ? parseFloat(osVersion[0] + '.' + osVersion[1]) : 0,
    isInWechat: /micromessenger/i.test(ua),

    joinPath: function () {
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

    randomString: function (len) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
            uuid = '',
            rnd = 0,
            r;
        for (var i = 0; i < len; i++) {
            if (i == 8 || i == 13 || i == 18 || i == 23) {
                uuid += '-';
            } else if (i == 14) {
                uuid += '4';
            } else {
                if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid += chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid;
    },

    uuid: function () {
        return this.randomString(36);
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

    contains: contains,

    equals: equals,

    identifyWith: function (a, b) {
        return equals(a, b, true);
    },

    keys: function (obj) {
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj)
            if (hasOwnProperty.call(obj, key)) keys.push(key);
        return keys;
    },

    extend: function (proto) {
        var parent = this,
            child = hasOwnProperty.call(proto, 'constructor') ? proto.constructor : function () {
                return parent.apply(this, arguments);
            };

        var Surrogate = function () {
            this.constructor = child;
        };
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

    query: function (query, arr) {
        if (!arr) return compileQuery(query);

        var match = compileQuery(query);
        var results = [];

        for (var i = 0, n = arr.length; i < n; i++) {
            if (match(attr[i])) results.push(arr[i]);
        }

        return results;
    },

    //@query='day,sum(amount)'
    //@data=[{ day:333,amout:22 },{ day:333,amout:22 }]
    //@return=[{key:{ day: 333 },sum: 44, group: [...]}]
    groupBy: function (query, data) {
        var results = [];
        var keys = [];
        var operations = [];

        query.split(/\s*,\s*/).forEach(function (item) {
            var m = /(sum|avg)\(([^\)]+)\)/.exec(item);

            console.log(m);

            if (m) {
                operations.push({
                    operation: m[1],
                    key: m[2]
                })

            } else {
                keys.push(item);
            }
        });

        data.forEach(function (item) {
            var key = {};
            var group = false;

            for (var j = 0, k = keys.length; j < k; j++) {
                key[keys[j]] = item[keys[j]];
            }

            for (var i = 0, n = results.length; i < n; i++) {

                if (equals(results[i].key, key)) {
                    group = results[i];
                    break;
                }
            }

            if (!group) {
                group = {
                    key: key,
                    count: 0,
                    group: []
                }
                results.push(group);
            }

            for (var i = 0, n = operations.length; i < n; i++) {
                var okey = operations[i].key;

                switch (operations[i].operation) {
                    case 'sum':
                        if (!group.sum) {
                            group.sum = {};
                        }
                        if (group.sum[okey] === undefined) {
                            group.sum[okey] = 0;
                        }
                        group.sum[okey] += item[okey];
                        break;
                    case 'avg':
                        if (!group.avg) {
                            group.avg = {};
                        }
                        if (group.avg[okey] === undefined) {
                            group.avg[okey] = 0;
                        }
                        group.avg[okey] = (group.avg[okey] * group.count + item[okey]) / (group.count + 1);
                        break;
                }
            }

            group.count++;
            group.group.push(item);

        });
        return results;
    },

    sum: function (arr, key) {
        var fn;
        var result = 0;

        if (typeof key === 'string') {
            for (var i = 0, n = arr.length; i < n; i++) {
                result += arr[i][key];
            }

        } else {
            for (var i = 0, n = arr.length; i < n; i++) {
                result += key(arr[i], i);
            }
        }

        return result;
    },

    indexOf: function (arr, key, val) {
        var length = arr.length;
        var keyType = typeof key;

        if (keyType === 'string' && arguments.length == 3) {
            for (var i = 0; i < length; i++) {
                if (arr[i][key] == val) return i;
            }

        } else if (keyType === 'function') {
            for (var i = 0; i < length; i++) {
                if (key(arr[i], i)) return i;
            }

        } else {
            for (var i = 0; i < length; i++) {
                if (contains(arr[i], key)) return i;
            }
        }

        return -1;
    },

    lastIndexOf: function (arr, key, val) {
        var length = arr.length;
        var keyType = typeof key;

        if (keyType === 'string' && arguments.length == 3) {
            for (var i = arr.length - 1; i >= 0; i--) {
                if (arr[i][key] == val) return i;
            }

        } else if (keyType === 'function') {
            for (var i = arr.length - 1; i >= 0; i--) {
                if (key(arr[i], i)) return i;
            }

        } else {
            for (var i = arr.length - 1; i >= 0; i--) {
                if (contains(arr[i], key)) return i;
            }
        }

        return -1;
    },

    map: function (arr, key) {
        var result = [];

        if (typeof key === 'string') {
            for (var i = 0, len = arr.length; i < len; i++) {
                result.push(arr[i][key]);
            }

        } else if (Array.isArray(key)) {
            var item;
            var k;
            for (var i = 0, len = arr.length; i < len; i++) {
                item = {};
                for (var j = key.length - 1; j >= 0; j--) {
                    k = key[j];
                    if (k in arr[i]) item[k] = arr[i][k];
                }
                result.push(item);
            }

        } else {
            for (var i = 0, len = arr.length; i < len; i++) {
                result.push(key(arr[i], i));
            }
        }

        return result;
    },

    first: function (arr, key, val) {

        if (typeof key === 'string' && arguments.length == 3) {

            for (var i = 0, len = arr.length; i < len; i++) {
                if (arr[i][key] == val) return arr[i];
            }
        } else if (typeof key === 'function') {

            for (var i = 0, len = arr.length; i < len; i++) {
                if (key(arr[i], i)) return arr[i];
            }
        } else {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (contains(arr[i], key)) return arr[i];
            }
        }

        return null;
    },

    exclude: function (arr, key, val) {
        var length = arr.length;
        var keyType = typeof key;
        var result = [];

        if (keyType === 'string' && arguments.length == 3) {
            for (var i = 0; i < length; i++) {
                if (arr[i][key] != val)
                    result.push(arr[i]);
            }

        } else if (keyType === 'function') {
            for (var i = 0; i < length; i++) {
                if (!key(arr[i], i))
                    result.push(arr[i]);
            }

        } else {
            for (var i = 0; i < length; i++) {
                if (!contains(arr[i], key))
                    result.push(arr[i]);
            }
        }

        return result;
    },

    find: function (arr, key, val) {
        var length = arr.length;
        var keyType = typeof key;
        var result = [];

        if (keyType === 'string' && arguments.length == 3) {
            for (var i = 0; i < length; i++) {
                if (arr[i][key] == val)
                    result.push(arr[i]);
            }

        } else if (keyType === 'function') {
            for (var i = 0; i < length; i++) {
                if (key(arr[i], i))
                    result.push(arr[i]);
            }

        } else {
            for (var i = 0; i < length; i++) {
                if (contains(arr[i], key))
                    result.push(arr[i]);
            }
        }

        return result;
    },

    remove: function (arr, key, val) {
        var length = arr.length;
        var keyType = typeof key;
        var result = [];

        if (keyType === 'string' && arguments.length == 3) {
            for (var i = length - 1; i >= 0; i--) {
                if (arr[i][key] == val)
                    arr.splice(i, 1);
            }

        } else if (keyType === 'function') {
            for (var i = length - 1; i >= 0; i--) {
                if (key(arr[i], i))
                    arr.splice(i, 1);
            }

        } else {
            for (var i = length - 1; i >= 0; i--) {
                if (contains(arr[i], key))
                    arr.splice(i, 1);
            }
        }

        return result;
    },

    pick: function (obj, iteratee) {
        var result = {},
            key;
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

    pad: function (num, n) {
        var a = '0000000000000000' + num;
        return a.substr(a.length - (n || 2));
    },

    formatMoney: function (number) {
        return (number + '').replace(/(\d{3})+(\.|$)/, function (match, a) {
            return match.replace(/\d{3}/g, function (a) {
                return ',' + a
            })
        }).replace(/^,/, '');
    },

    value: function (data, names) {
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

    timeLeft: function (timestamp) {
        var pad = this.pad;
        var days = Math.floor(timestamp / (1000 * 60 * 60 * 24));
        timestamp = timestamp % (1000 * 60 * 60 * 24);

        var hours = Math.floor(timestamp / (1000 * 60 * 60));
        timestamp = timestamp % (1000 * 60 * 60);

        var minutes = Math.floor(timestamp / (1000 * 60));
        timestamp = timestamp % (1000 * 60);

        var seconds = Math.floor(timestamp / 1000);
        timestamp = timestamp % (1000);

        return (days == 0 ? '' : (days + '天 ')) +
            pad(hours) + ":" +
            pad(minutes) + ":" +
            pad(seconds)
    },

    //yyyy-MM-dd HH:mm:ss
    parseDate: function (date) {
        date = date.split(/\s+|\:|\-|年|月|日|\//).map(function (time) {
            return parseInt(time);
        });

        return new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);
    },

    formatDate: function (d, f) {
        if (typeof d === "string" && /^\/Date\(\d+\)\/$/.test(d)) {
            d = new Function("return new " + d.replace(/\//g, ''))();
        } else if (typeof d === 'string' && !f) {
            f = d, d = new Date;
        } else if (typeof d === 'number') {
            d = new Date(d);
        } else if (!(d instanceof Date)) {
            return '';
        }
        var pad = util.pad;

        if (f === 'minutes') {
            var now = new Date();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            var res = '';
            if (today - date == 86400000) {
                res += '昨天 ';
            } else if (today - date == 0) {
                //res += '今天';
            } else {
                res += pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + " ";
            }
            res += pad(d.getHours()) + ':' + pad(d.getMinutes());
            return res;

        } else if (f === 'short') {
            var now = new Date();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            if (today - date == 86400000) {
                return '昨天' + pad(d.getHours()) + ':' + pad(d.getMinutes());

            } else if (today - date == 0) {
                var minutes = Math.round((now - d) / 60000);

                if (minutes <= 2) {
                    return '刚刚';

                } else if (minutes < 60) {
                    return minutes + '分钟前';

                } else {
                    var hours = Math.round(minutes / 60);
                    if (hours < 12) {
                        return hours + '小时前';
                    } else {
                        return pad(d.getHours()) + ':' + pad(d.getMinutes());
                    }
                }

            } else {
                return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
            }
        }

        var week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

        var y = d.getFullYear() + "",
            M = d.getMonth() + 1,
            D = d.getDate(),
            H = d.getHours(),
            m = d.getMinutes(),
            s = d.getSeconds(),
            mill = d.getMilliseconds() + "0000";
        return (f || 'yyyy-MM-dd HH:mm:ss').replace(/\y{4}/, y)
            .replace(/y{2}/, y.substr(2, 2))
            .replace(/M{2}/, pad(M))
            .replace(/M/, M)
            .replace(/W/, week[d.getDay()])
            .replace(/d{2,}/, pad(D))
            .replace(/d/, D)
            .replace(/H{2,}/i, pad(H))
            .replace(/H/i, H)
            .replace(/m{2,}/, pad(m))
            .replace(/m/, m)
            .replace(/s{2,}/, pad(s))
            .replace(/s/, s)
            .replace(/f+/, function (w) {
                return mill.substr(0, w.length)
            });
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

    fixFloat: function (f) {
        return Math.round((typeof f === 'number' ? f : parseFloat(f || 0)) * 100) / 100;
    },

    currency: function (prefix, str) {
        if (str == undefined) {
            str = prefix;
            prefix = null;
        }
        return (prefix === undefined || prefix === null ? '' : prefix) + ((Math.round(parseFloat(str) * 100) / 100) || 0);
    },

    rmb: function (str) {
        return currency('¥', str);
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
        return url ? url.replace(/^http\:\/\/[^\/]+|\?.*$/g, '').toLowerCase() : null;
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
    store: typeof localStorage !== 'undefined' ? function (key, value) {
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

util.filter = util.find;

module.exports = util;