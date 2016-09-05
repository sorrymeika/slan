
var $ = require('$'),
    util = require('util'),
    Base = require('./base'),
    Event = require('./event'),
    Component = require('./component');

var toString = {}.toString;
var ArrayProto = Array.prototype;

var snEvents = ['tap', 'click', 'change', 'focus', 'blur', 'transition-end'];
var GlobalVariables = ['this', '$', 'Math', 'new', 'Date', 'encodeURIComponent', 'window', 'document'];

var rfilter = /\s*\|\s*([a-zA-Z_0-9]+)((?:\s*(?:\:|;)\s*\({0,1}\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)/g;
var rvalue = /^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/;
var rrepeat = /([a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+){0,})(?:\s*\|\s*filter\s*\:\s*(.+?)){0,1}(?:\s*\|\s*orderBy\:(.+)){0,1}(\s|$)/;
var rmatch = /\{\s*(.+?)\s*\}(?!\s*\})/g;
var rvar = /'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/[img]*(?=[\)|\.|,])|\/\/.*|\bvar\s+[_,a-zA-Z0-9]+\s*\=|(^|[\!\=\>\<\?\s\:\(\),\%&\|\+\-\*\/\[\]]+)([\$a-zA-Z_][\$a-zA-Z_0-9]*(?:\.[a-zA-Z_0-9]+)*(?![a-zA-Z_0-9]*\())/g;
var rset = /([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+)*)\s*=\s*((?:\((?:'(?:\\'|[^'])*'|[^\)])+\)|'(?:\\'|[^'])*'|[^;])+?)(?=\;|\,|$)/g;
var rthis = /\b((?:this\.){0,1}[\.\w]+\()((?:'(?:\\'|[^'])*'|[^\)])*)\)/g;

var Filters = {
    contains: function (source, keywords) {
        return source.indexOf(keywords) != -1;
    },
    like: function (source, keywords) {
        source = source.toLowerCase();
        keywords = keywords.toLowerCase();
        return source.indexOf(keywords) != -1 || keywords.indexOf(source) != -1;
    },
    util: util
};

var filterCode = (function () {
    var res = '';
    for (var key in Filters) {
        res += 'var ' + key + '=$data.' + key + ';';
    }
    return res;
})()

var valueCode = function (str, variables) {
    var arr = str.split('.');
    var alias = arr[0];
    var result = [];
    var code = '';
    var gb = alias == '$global' ? arr.shift() : '$data';

    if (!alias || alias in Filters || GlobalVariables.indexOf(alias) != -1 || (variables && variables.indexOf(alias) != -1) || rvalue.test(str)) {
        return str;
    }

    str = gb + '.' + str;

    for (var i = 0; i < arr.length; i++) {
        result[i] = (i == 0 ? gb : result[i - 1]) + '.' + arr[i];
    }
    for (var i = 0; i < result.length; i++) {
        code += (i ? '&&' : '') + result[i] + '!==null&&' + result[i] + '!==undefined';
    }
    return '((' + code + ')?typeof ' + str + '==="function"?' + str + '():' + str + ':"")';
}

function eachElement(el, fn) {
    if (!el) return;

    if ('length' in el && el.nodeType !== 3) {
        for (var i = 0, len = el.length; i < len; i++) {
            eachElement(el[i], fn);
        }
        return;
    }
    var stack = [];

    while (el) {
        var flag = fn(el);
        var nextSibling = flag && flag.nodeType ? flag : el.nextSibling;

        if (flag !== false && el.firstChild) {
            if (nextSibling) {
                stack.push(nextSibling);
            }
            el = el.firstChild;

        } else if (nextSibling) {
            el = nextSibling;
        } else {
            el = stack.pop();
        }
    }
}


function cloneElement(el, fn) {

    eachElement(el, function (node) {
        var clone = node.cloneNode(false);
        node._clone = clone;

        if (node.parentNode && node.parentNode._clone) {
            node.parentNode._clone.appendChild(clone);
        }

        fn(node, clone);
    });

    return el._clone;
}

function insertElementAfter(cursorElem, elem) {
    if (cursorElem.nextSibling != elem) {
        cursorElem.nextSibling ?
            cursorElem.parentNode.insertBefore(elem, cursorElem.nextSibling) :
            cursorElem.parentNode.appendChild(elem);
    }
}

function closestElement(el, fn) {
    for (var parentNode = el.parentNode; parentNode && !parentNode.snViewModel; parentNode = parentNode.parentNode) {
        if (fn(parentNode, el)) {
            return parentNode;
        }
    }
    return null;
}


function genFunction(expression) {
    if (!rmatch.test(expression)) return;

    var variables;
    var isGlobal = false;

    var content = filterCode + 'try{return \'' +
        expression
            .replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
            .replace(rmatch, function (match, exp) {
                return '\'+('
                    + exp.replace(/\\\\/g, '\\')
                        .replace(/\\'/g, '\'')
                        .replace(rvar, function (match, prefix, name) {
                            if (!name) {
                                if (match.indexOf('var ') == 0) {
                                    return match.replace(/var\s+([^\=]+)\=/, function (match, $0) {
                                        variables = (variables || []).concat($0.split(','));
                                        return $0 + '=';
                                    });
                                }
                                return match;
                            }

                            if (name.indexOf("$global.") == 0) {
                                isGlobal = true;
                            }
                            return prefix + valueCode(name, variables);
                        })
                    + ')+\'';
            }) +
        '\';}catch(e){console.error(e);return \'\';}';

    content = content.replace('return \'\'+', 'return ').replace(/\+\'\'/g, '')

    if (variables && variables.length) {
        content = 'var ' + variables.join(',') + ';' + content
    }

    return {
        isGlobal: isGlobal,
        code: content,
        variables: variables
    };
}


var Model = function (parent, key, data) {

    if (parent instanceof Model) {
        this.key = parent.key ? parent.key + '.' + key : key;

    } else if (parent instanceof Collection) {
        this.key = parent.key + '^child';

    } else {
        throw new Error('Model\'s parent mast be Collection or Model');
    }

    this.type = typeof data == 'object' ? 'object' : 'value';
    parent.data[key] = this.data = this.type == 'object' ? $.extend({}, data) : data;

    this._key = key;
    this.model = {};
    this.parent = parent;
    this.root = parent.root;

    this.set(data);
}

var ModelProto = {
    _fixParentData: function () {
        var parent = this.parent;
        parent.data[(parent instanceof Collection) ? parent.models.indexOf(this) : this._key] = this.data;
    },

    getModel: function (key) {
        if (typeof key == 'string' && key.indexOf('.') != -1) {
            key = key.split('.');
        }
        if ($.isArray(key)) {
            var model = this;
            if (key[0] == 'this') {
                for (var i = 1, len = key.length; i < len; i++) {
                    if (!(model = model[key[i]]))
                        return null;
                }
            } else {
                for (var i = 0, len = key.length; i < len; i++) {
                    if (model instanceof Model)
                        model = model.model[key[i]];
                    else if (model instanceof Collection)
                        model = model.models[key[i]];
                    else
                        return null;
                }
            }
            return model;
        }
        return key == 'this' ? this : key == '' ? this.data : this.model[key];
    },

    get: function (key) {
        if (typeof key == 'string' && key.indexOf('.') != -1) {
            key = key.split('.');
        }
        if ($.isArray(key)) {
            var data = this.data;

            for (var i = key[0] == 'this' ? 1 : 0, len = key.length; i < len; i++) {
                if (!(data = data[key[i]]))
                    return null;
            }
            return data;
        }
        return key == 'this' ? this : key == '' ? this.data : this.data[key];
    },

    findByKey: function (key) {
        var model = this.model;

        for (var k in model) {
            var mod = model[k];

            if (mod && mod.key == key) {
                return mod;
            }
            if (mod instanceof Model) {
                mod = mod.findByKey(key);

                if (mod)
                    return mod;
            }
        }

        return null;
    },

    cover: function (key, val) {
        return this.set(true, key, val);
    },

    set: function (cover, key, val) {
        var self = this,
            origin,
            changed,
            attrs,
            model = self.model,
            parent,
            keys,
            coverChild = false;



        if (typeof cover != "boolean")
            val = key, key = cover, cover = false;

        var isArrayKey = $.isArray(key);

        if (!isArrayKey && typeof key == 'object') {
            attrs = key;

        } else if (key === null) {
            !cover && (cover = true);
            attrs = {};

        } else if (typeof val == 'undefined') {
            val = key, key = '', parent = this.parent;

            this.data = val;
            this._fixParentData();

            return this;

        } else {
            keys = isArrayKey ? key : key.split('.');

            if (keys.length > 1) {
                var lastKey = keys.pop();
                for (var i = 0, len = keys.length; i < len; i++) {
                    key = keys[i];

                    if (!(model[key] instanceof Model)) {
                        model = model[key] = new Model(this, key, {});
                    } else {
                        model = model[key];
                    }
                }
                model.set(cover, lastKey, val);
                return;

            } else {
                coverChild = cover;
                cover = false;
                (attrs = {})[key] = val;
            }
        }
        if (!$.isPlainObject(this.data)) this.data = {}, this._fixParentData();

        if (cover) {
            for (var attr in this.data) {
                if (attrs[attr] === undefined) {
                    attrs[attr] = null;
                }
            }
        }

        for (var key in attrs) {
            this.data[key] = attrs[key];
        }
        var eventName;

        for (var attr in attrs) {
            origin = model[attr];
            value = attrs[attr];
            eventName = this.key ? this.key + '/' + attr : attr;

            if (origin !== value) {

                if (origin instanceof Model) {

                    value === null || value === undefined ? origin.reset() : origin.set(coverChild, value);
                    this.data[attr] = origin.data;

                } else if (origin instanceof Collection) {
                    if (!$.isArray(value)) {
                        if (value == null) {
                            value = [];
                        } else {
                            throw new Error('[Array to ' + (typeof value) + ' error]不可改变' + attr + '的数据类型');
                        }
                    }
                    origin.set(value);
                    this.data[attr] = origin.data;

                } else {

                    switch (toString.call(value)) {
                        case '[object Object]':
                            model[attr] = new Model(this, attr, value);
                            break;
                        case '[object Array]':
                            model[attr] = new Collection(this, attr, value);
                            break;
                        default:
                            model[attr] = value;
                            break;
                    }
                }
            }
        }

        this.root.updateViewNextTick();

        return self;
    },

    reset: function () {

        var data = {};
        for (var attr in this.data) {
            data[attr] = null;
        }
        this.set(data);
    },

    closest: function (key) {
        var res;
        for (var parent = this.parent; parent != null; parent = parent.parent) {
            res = typeof key == 'function' ? key(parent) : (parent.key == key ? 1 : 0);
            if (res) {
                return parent;
            } else if (res === false) {
                return null;
            }
        }
    },

    contains: function (model, excludeCollection) {
        for (model = model.parent; model != null; model = model.parent) {
            if (model == this) {
                return true;
            } else if (excludeCollection && model instanceof Collection)
                return false;
        }
        return false;
    },

    under: function (parent) {
        for (var model = this.parent; model != null && parent != model; model = model.parent) {
            if (model instanceof Collection) {
                return false;
            }
        }
        return true;
    }
}

Model.prototype = ModelProto;


var Collection = function (parent, attr, data) {

    this.models = [];

    this.parent = parent;
    this.key = parent.key ? (parent.key + "." + attr) : attr;
    this._key = attr;

    this.root = parent.root;

    this.data = [];
    parent.data[attr] = this.data;

    this.add(data);
}

Collection.prototype = {

    get: function (i) {
        return this.models[i];
    },

    set: function (data) {

        if (!data || data.length == 0) {
            this.clear();

        } else {
            var modelsLen = this.models.length;

            if (data.length < modelsLen) {
                this.remove(data.length, modelsLen - data.length)
            }

            var i = 0;
            this.each(function (model) {
                model.set(true, data[i]);
                i++;
            });

            this.add(i == 0 ? data : data.slice(i, data.length));
        }
        return this;
    },

    each: function (fn) {
        for (var i = 0; i < this.models.length; i++) {
            if (fn.call(this, this.models[i], i) === false) break;
        }
        return this;
    },

    find: function (fn) {
        for (var i = 0; i < this.models.length; i++) {
            if (fn.call(this, this.data[i], i)) {
                return this.models[i];
            }
        }
        return null;
    },

    add: function (data) {
        var model;
        var length;

        if (!$.isArray(data)) {
            data = [data];
        }

        for (var i = 0, dataLen = data.length; i < dataLen; i++) {
            var dataItem = data[i];
            length = this.models.length;
            model = new Model(this, length, dataItem);
            this.models.push(model);
        }
        this.root.updateViewNextTick();
    },

    remove: function (start, count) {
        var models;

        if (typeof start == 'function') {
            models = [];
            for (var i = this.models.length - 1; i >= 0; i--) {
                if (start.call(this, this.data[i], i)) {
                    models.push(this.models.splice(i, 1)[0]);
                    this.data.splice(i, 1);
                }
            }

        } else {
            if (!count) count = 1;

            models = this.models.splice(start, count);
            this.data.splice(start, count);
        }

        this.root.updateViewNextTick();
    },

    clear: function (data) {
        this.models.length = this.data.length = 0;

        this.root.updateViewNextTick();
    }
}


function RepeatSource(el, parent) {
    var self = this;
    var attrRepeat = el.getAttribute('sn-repeat');
    var match = attrRepeat.match(rrepeat);
    var collectionKey = match[3];
    var attrs = collectionKey.split('.');
    var parentAlias = attrs[0];
    var filter = match[4];

    if (filter) {
        var res = genFunction('{' + filter + '}');

        if (res) {
            this.filter = new Function('$data', res.code);
            this.filterIsGlobal = res.isGlobal;
        }
    }

    this.alias = match[1];
    this.loopIndexAlias = match[2];
    this.key = attrs[attrs.length - 1];
    this.parent = parent;
    this.source = el;
    this.children = [];
    this.orderBy = match[5];
    this.attrs = attrs;
    this.parentAlias = parentAlias;

    var replacement = document.createComment(collectionKey);
    replacement.snRepeatSource = this;
    el.parentNode.replaceChild(replacement, el);

    this.replacement = replacement;

    parent && parent.appendChild(this);

    if (parentAlias == '$global') {
        this.isGlobal = true;

    } else {
        this.isGlobal = false;

        while (parent) {
            if (parent.alias == parentAlias) {
                attrs[0] = parent.collectionKey + '^child';
                collectionKey = attrs.join('.');
                this.offsetParent = parent;
                break;
            }
            parent = parent.parent;
        }
    }

    replacement.snIsGlobal = this.isGlobal || this.filterIsGlobal;

    this.collectionKey = collectionKey;
}

RepeatSource.isRepeatNode = function (node) {
    return node.nodeType == 1 && node.getAttribute('sn-repeat');
}

RepeatSource.prototype.appendChild = function (child) {
    this.children.push(child);
}


function ViewModel(el, data) {
    if (typeof data === 'undefined' && (el == undefined || $.isPlainObject(el)))
        data = el, el = this.el;

    this.updateView = this.updateView.bind(this);
    this.cid = util.guid();

    this.data = $.extend({}, data);
    this.model = {};
    this.repeats = {};
    this._expressions = {
        length: 0
    };
    this.fns = [];
    this.refs = {};
    this.root = this;

    el && this.bind(el);

    this.set(this.data);

    this.initialize.call(this, el, data);
}

ViewModel.prototype = Object.assign(Object.create(ModelProto), {

    _updateElementData: function (el, modelName, value) {
        var attrs = modelName.split('.');
        var model;


        if (el.snData && attrs[0] in el.snData) {
            model = el.snData[attrs.shift()];
        } else {
            model = this;
        }
        model.set(attrs, value);
    },

    initialize: util.noop,

    getFunctionId: function (expression) {
        if (!expression) return null;

        expression = expression.replace(/^\s+|\s+$/g, '');

        if (!expression) return null;

        var expObj = this._expressions[expression];

        if (expObj) {
            return expObj;
        }

        var res = genFunction(expression);

        if (!res) return null;

        this._codes.push('function($data){' + res.code + '}');

        var id = this._expressions.length++;

        var ret = {
            id: id,
            isGlobal: res.isGlobal
        }

        this._expressions[expression] = ret;

        return ret;
    },

    twoWayBinding: function (el) {
        var self = this;

        if (el.nodeType == 3) {
            var fid = self.getFunctionId(el.textContent);

            if (fid) {
                el.snBinding = {
                    textContent: fid.id
                };
                el.snIsGlobal = fid.isGlobal;
            }
            return;
        }

        for (var j = el.attributes.length - 1; j >= 0; j--) {
            var attr = el.attributes[j].name;
            var val = el.attributes[j].value;

            if (val) {
                if (attr == 'sn-error') {
                    attr = 'onerror'
                } else if (attr == 'sn-src') {
                    attr = 'src'
                }
                if (attr == "ref") {
                    self.refs[val] = el;

                } else if (attr == 'sn-display' || attr == 'sn-html' || attr == 'sn-if' || attr == 'sn-style' || attr.indexOf('sn-') != 0) {
                    if (attr.indexOf('sn-') == 0 && val.indexOf("{") == -1 && val.indexOf("}") == -1) {
                        val = '{' + val + '}';
                    }

                    var fid = self.getFunctionId(val);

                    if (fid) {
                        (el.snBinding || (el.snBinding = {}))[attr] = fid.id;
                        el.snIsGlobal = fid.isGlobal;
                    }

                } else if (attr == 'sn-model') {
                    el.removeAttribute(attr);
                    el.setAttribute("sn-" + self.cid + "model", val);

                } else {

                    //处理事件绑定
                    var origAttr = attr;

                    attr = attr.replace(/^sn-/, '');

                    if (snEvents.indexOf(attr) != -1) {
                        el.removeAttribute(origAttr);

                        attr = "sn-" + self.cid + attr;

                        if (rset.test(val) || rthis.test(val)) {
                            var content = val.replace(rthis, function (match, $1, $2) {
                                return $1 + "e" + ($2 ? ',' : '') + $2 + ")";

                            }).replace(rset, 'this._updateElementData(e.currentTarget,"$1",$2)');
                            var fid = self.getFunctionId(content);
                            if (fid) {
                                el.setAttribute(attr, fid.id);
                            }

                        } else {
                            el.setAttribute(attr, val);
                        }
                    }
                }
            }
        }
    },

    formatData: function (snData) {
        var data = Object.assign({}, Filters, this.data);

        if (snData) {
            for (var key in snData) {
                var model = snData[key];

                if (model instanceof Model || model instanceof Collection) {
                    data[key] = model.data;

                } else {
                    data[key] = model;
                }
            }
        }
        return data
    },

    updateElement: function (el, attribute) {

        if (!el.snBinding) return;

        var self = this;
        var attrsBinding;
        var data = this.formatData(el.snData);

        if (attribute)
            (attrsBinding = {})[attribute] = el.snBinding[attribute];
        else
            attrsBinding = el.snBinding;

        var attrs = el.snAttrs || (el.snAttrs = {});

        for (var attr in attrsBinding) {
            var val = self.fns[attrsBinding[attr]].call(self, data);

            if (attrs[attr] === val) continue;

            attrs[attr] = val;

            console.log('updateElement:', attr, val);

            switch (attr) {
                case 'textContent':
                    el.textContent = val;
                    break;
                case 'value':
                    if (el.tagName == 'INPUT' || el.tagName == 'SELECT' || el.tagName == 'TEXTAREA') {
                        if (el.value != val || el.value === '' && val === 0) {
                            el.value = val;
                        }
                    } else
                        el.setAttribute(attr, val);
                    break;
                case 'html':
                case 'sn-html':
                    el.innerHTML = val;
                    break;
                case 'sn-if':
                    if (util.isFalse(val)) {
                        if (el.parentNode) {
                            if (!el.snReplacement) {
                                el.snReplacement = document.createComment('if');
                                el.parentNode.insertBefore(el.snReplacement, el);
                            }
                            el.parentNode.removeChild(el);
                        }

                    } else {
                        if (!el.parentNode) {
                            el.snReplacement.parentNode.insertBefore(el, el.snReplacement);
                        }
                    }
                    break;
                case 'display':
                case 'sn-display':
                    el.style.display = util.isFalse(val) ? 'none' : val == 'block' || val == 'inline' || val == 'inline-block' ? val : '';
                    break;
                case 'sn-style':
                case 'style':
                    el.style.cssText += val;
                    break;
                case 'checked':
                case 'selected':
                    (el[attr] = !!val) ? el.setAttribute(attr, attr) : el.removeAttribute(attr);
                    break;
                case 'src':
                case 'sn-src':
                    var $el = $(el).one('load error', function () {
                        $el.animate({
                            opacity: 1
                        }, 200);
                    }).css({
                        opacity: 0

                    }).attr({
                        src: val
                    });
                    break;
                default:
                    el.setAttribute(attr, val);
                    break;
            }
        }

    },

    updateRepeatElement: function (el) {
        var self = this;
        var repeatSource = el.snRepeatSource;
        var collection = el.snCollection;
        var model;
        var offsetParent = repeatSource.offsetParent;
        var orderBy = repeatSource.orderBy;

        if (!collection) {

            if (repeatSource.isGlobal) {
                model = this.$global;

            } else if (!offsetParent) {
                model = this;

            } else {
                closestElement(el, function (parentNode) {
                    if (parentNode.snRepeatSource == offsetParent) {
                        model = parentNode.snModel;
                        return true;
                    }
                })
            }

            collection = model && model.findByKey(repeatSource.collectionKey);

            if (!collection) return;

            el.snCollection = collection;
        }

        var elements = el.snElements || (el.snElements = []);
        var list = [];
        var cursorElem = el;
        var elemContain = {};
        var elementsLength = elements.length;

        collection.each(function (model) {

            var hasElem = false;
            var elem;
            var elemIndex = -1;
            var snData;
            var isInData = true;

            for (var j = 0; j < elementsLength; j++) {
                elem = elements[j];

                if (elem.snModel == model) {
                    elemContain[j] = true;
                    hasElem = true;
                    elemIndex = j;
                    break;
                }
            }

            if (!hasElem) {
                snData = {};

                if (repeatSource.parent) {
                    closestElement(el, function (parentNode) {
                        if (parentNode.snRepeatSource && parentNode.snData) {
                            Object.assign(snData, parentNode.snData);
                            return true;
                        }
                    });
                }
                snData[repeatSource.alias] = model;

            } else {
                snData = elem.snData;
            }

            if (repeatSource.filter) {
                isInData = repeatSource.filter(self.formatData(snData));
            }

            if (isInData) {

                if (!hasElem) {
                    elem = cloneElement(repeatSource.source, function (node, clone) {

                        clone.snData = snData;
                        clone.snIsGlobal = node.snIsGlobal;

                        if (node.snRepeatSource) {
                            clone.snRepeatSource = node.snRepeatSource;
                        }
                        if (node.snBinding) {
                            clone.snBinding = node.snBinding;
                        }
                    });

                    elem.snRepeatSource = repeatSource;
                    elem.snModel = model;

                    elements.push(elem);
                }

                list.push({
                    el: elem,
                    model: model
                });

            } else if (elemIndex != -1) {
                elemContain[elemIndex] = false;
            }

        });

        if (orderBy)
            list.sort(function (a, b) {
                a = a.model.data[orderBy];
                b = b.model.data[orderBy];
                return a > b ? 1 : a < b ? -1 : 0;
            });

        list.forEach(function (item, index) {
            var elem = item.el;

            insertElementAfter(cursorElem, elem);
            cursorElem = elem;

            repeatSource.loopIndexAlias && (elem.snData[repeatSource.loopIndexAlias] = index);
        });

        //移除过滤掉的element
        for (var i = 0; i < elementsLength; i++) {
            if (!elemContain[i]) {
                var elem = elements[i];
                elem.parentNode && elem.parentNode.removeChild(elem);
            }
        }

        return cursorElem;
    },

    updateViewNextTick: function () {
        if (!this._nextTick) {
            this._nextTick = requestAnimationFrame(this.updateView);
        }
    },

    updateView: function () {

        var self = this;

        eachElement(this.$el, function (el) {

            if (el.nodeType == 8 && el.snRepeatSource) {

                self.updateRepeatElement(el);

            } else if (el.snBinding) {
                self.updateElement(el);
            }

        });

        this._nextTick = false;
    },

    bind: function (el) {
        var self = this;
        var elements = [];
        var snModelName = 'sn-' + self.cid + 'model';

        var $el = $(el).on('input change blur', '[' + snModelName + ']', function (e) {
            var target = e.currentTarget;

            self._updateElementData(target, target.getAttribute(snModelName), target.value);
        });

        this._codes = [];

        eachElement($el, function (node) {
            if (node.snViewModel) return false;

            self.twoWayBinding(node);

            var parentRepeatSource;
            for (var parentNode = node.parentNode; parentNode && !parentNode.snViewModel; parentNode = parentNode.parentNode) {
                if (parentNode.snRepeatSource) {
                    parentRepeatSource = parentNode.snRepeatSource;
                    break;
                }
            }

            if (RepeatSource.isRepeatNode(node)) {
                var nextSibling = node.nextSibling;
                var repeatSource = new RepeatSource(node, parentRepeatSource);

                node.snRepeatSource = repeatSource;

                return nextSibling;
            }
        });

        var fns = new Function('return [' + this._codes.join(',') + ']')();

        fns.forEach(function (fn) {
            self.fns.push(fn);
        });

        self.$el = !self.$el ? $el : self.$el.add($el);

        $el.each(function () { this.snViewModel = self; })

        return this;
    }

});

ViewModel.extend = util.extend;

exports.Global = ViewModel.prototype.$global = new ViewModel();
exports.ViewModel = ViewModel;
exports.Filters = Filters;


exports.Global.updateView = function () {

    eachElement(document.body, function (el) {
        if (el.snIsGlobal) {

            var model;

            for (var parentNode = el; parentNode; parentNode = parentNode.parentNode) {
                if (parentNode.snViewModel) {
                    model = parentNode.snViewModel;
                    break;
                }
            }

            if (model) {
                if (el.nodeType == 8 && el.snRepeatSource) {
                    model.updateRepeatElement(el);

                } else {
                    model.updateElement(el);
                }
            }


        }
    });

}.bind(exports.Global)


/*

var model = new exports.ViewModel($('<div><div sn-repeat="item in data"><span>{{item.name}}</span><i sn-repeat="p in children">{{p.name}}</i></div></div>'), {
    data: [{
        name: '1234'
    }, {
            name: '2234'
        }],

    children: [{
        name: 'aaa'
    }]
});
    
    this.model = new model.ViewModel($('<div><div sn-repeat="item in data"><span>{{item.name}}</span><i sn-repeat="p in item.children">{{p.name}}</i></div></div>'), {
        data: [{
            name: '1234',
            children: [{
                name: 'aaa'
            }]
        }]
    });
    this.model.$el.appendTo($('body'));
    
    
    var data = {
        data: []
    }
    
    var data1={
        name:'state',
        data:[]
    }

    for (var i = 0; i < 10; i++) {
        data.data.push({
            id: i,
            name: 'adsf' + i,
            src: "http://" + i
        });
        
        data1.data.push({
            id: i,
            name: 'adsf' + i,
            src: "http://" + i
        });
    }

    this.model = new model.ViewModel($(<div>{{$state.name}}</div>), data);
        
    this.model.setState(data1);

    this.model.$el.appendTo($main.html(''));
    return;
*/