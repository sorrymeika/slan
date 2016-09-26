
var $ = require('$');
var Base = require('./base');
var util = require('util');
var Event = require('./event');

var toString = {}.toString;

var ModelEvents = {
    tap: 'tap',
    'long-tap': 'longTap',
    'transition-end': $.fx.transitionEnd,
    touchstart: 'touchstart',
    touchend: 'touchend',
    touchmove: 'touchmove',
    click: 'click',
    change: 'change',
    input: 'input',
    focus: 'focus',
    blur: 'blur'
};
var GlobalVariables = ['this', '$', "JSON", 'Math', 'new', 'Date', 'encodeURIComponent', 'window', 'document'];

var rfilter = /\s*\|\s*([a-zA-Z_0-9]+)((?:\s*(?:\:|;)\s*\({0,1}\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)/g;
var rvalue = /^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/;
var rrepeat = /([$a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([$a-zA-Z_0-9]+(?:\.[$a-zA-Z_0-9]+){0,})(?:\s*\|\s*filter\s*\:\s*(.+?)){0,1}(?:\s*\|\s*orderBy\:(.+)){0,1}(\s|$)/;
var rmatch = /\{\s*(.+?)\s*\}(?!\s*\})/g;
var rvar = /'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/[img]*(?=[\)|\.|,])|\/\/.*|\bvar\s+[_,a-zA-Z0-9]+\s*\=|(^|[\!\=\>\<\?\s\:\(\),\%&\|\+\-\*\/\[\]]+)([\$a-zA-Z_][\$a-zA-Z_0-9]*(?:\.[a-zA-Z_0-9]+)*(?![a-zA-Z_0-9]*\())/g;
var rset = /([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+)*)\s*=\s*((?:\((?:'(?:\\'|[^'])*'|[^\)])+\)|'(?:\\'|[^'])*'|[^;])+?)(?=\;|\,|\:|$)/g;
var rfunc = /\b((?:this\.){0,1}[\.\w]+\()((?:'(?:\\'|[^'])*'|[^\)])*)\)/g;

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
    var gb = '$data';

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
    var firstLoop = true;

    while (el) {
        var flag = fn(el);
        var nextSibling;

        if (flag && flag.nodeType) {
            nextSibling = flag;

        } else if (flag && flag.isBreak) {
            nextSibling = flag.nextSibling;
            flag = false;

        } else if (!firstLoop) {
            nextSibling = el.nextSibling;
        }
        if (firstLoop) firstLoop = false;

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

function setRefs(viewModel, el) {
    var refName = el.getAttribute('ref');

    if (refName) {
        var ref = el.snRequireInstance || el;
        var refs = viewModel.refs[refName];

        if (!refs) {
            viewModel.refs[refName] = ref;

        } else if (refs.nodeType) {
            viewModel.refs[refName] = [refs, ref];

        } else {
            refs.push(ref);
        }
    }
}

function updateRequireView(viewModel, el) {
    var data = viewModel.fns[el.getAttribute('sn-data')].call(viewModel, viewModel.formatData(el));
    var instance

    if (el.snRequireInstance) {
        instance = el.snRequireInstance;
        instance.set(data)

    } else {
        var children = [];
        var node;
        for (var i = 0, j = el.childNodes.length - 1; i < j; i++) {
            node = el.childNodes[i];

            if (node.nodeType !== 3) {
                children.push(node);
                node.snViewModel = viewModel;
                viewModel.$el.push(node);
            }
        }

        el.snRequireInstance = instance = new el.snRequire(data, children);

        instance.$el.appendTo(el);
    }
}

function updateElement(viewModel, el) {
    if (el.nodeType == 8 && el.snRepeatSource) {
        viewModel.updateRepeatElement(el);

    } else if (el.snIfOrigin) {
        return { isBreak: true, nextSibling: el.snIfOrigin };

    } else {
        viewModel.updateElement(el);

        if (el.nodeType == 1) {
            if (el.snRequire) {
                updateRequireView(viewModel, el);
            }
            setRefs(viewModel, el);
        }

        if (el.snIf && !el.parentNode) {
            return { isBreak: true, nextSibling: el.snIf.nextSibling };
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
    for (var parentNode = el.parentNode; parentNode; parentNode = parentNode.parentNode) {
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


function syncParentData(model) {
    var parent = model.parent;
    parent.data[(parent instanceof Collection) ? parent.models.indexOf(model) : model._key] = model.data;
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

    findByKey: function (key) {
        var model = this.model;

        for (var k in model) {
            var mod = model[k];

            if (mod && (mod.key == key || mod.keys && mod.keys.indexOf(key) != -1)) {
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

            syncParentData(this);

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
        if (!$.isPlainObject(this.data)) this.data = {}, syncParentData(this);

        var data = this.data;

        if (cover) {
            for (var attr in data) {
                if (attrs[attr] === undefined) {
                    attrs[attr] = null;
                }
            }
        }

        for (var attr in attrs) {
            origin = model[attr];
            value = attrs[attr];

            if (origin !== value) {
                if (origin === undefined && (value instanceof ViewModel || value instanceof Collection)) {
                    model[attr] = value;
                    data[attr] = value.data;

                    if (value instanceof Collection)
                        (value.keys || (value.keys = [])).push(self.key ? self.key + '.' + attr : attr);

                    (value.root.parents || (value.root.parents = [])).push(this.root);

                } else if (origin instanceof Model) {

                    value === null || value === undefined ? origin.reset() : origin.set(coverChild, value);
                    data[attr] = origin.data;

                } else if (origin instanceof Collection) {
                    if (!$.isArray(value)) {
                        if (value == null) {
                            value = [];
                        } else {
                            throw new Error('[Array to ' + (typeof value) + ' error]不可改变' + attr + '的数据类型');
                        }
                    }
                    origin.set(value);
                    data[attr] = origin.data;

                } else {

                    switch (toString.call(value)) {
                        case '[object Object]':
                            value = new Model(this, attr, value);
                            data[attr] = value.data;
                            break;

                        case '[object Array]':
                            value = new Collection(this, attr, value);
                            data[attr] = value.data;
                            break;

                        default:
                            data[attr] = model[attr] = value;
                            break;
                    }
                    model[attr] = value;
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
    }
}

Model.prototype = ModelProto;


var Collection = function (parent, attr, data) {
    if ($.isArray(parent)) {
        data = parent;
        parent = null;
    }
    if (!parent) {
        parent = new ViewModel(false);
        attr = '$list';
    }

    this.models = [];

    this.parent = parent;
    this.key = parent.key ? (parent.key + "." + attr) : attr;
    this._key = attr;

    this.root = parent.root;

    this.data = [];
    parent.data[attr] = this.data;

    data && this.add(data);
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

        attrs.shift();
        collectionKey = attrs.join('.');

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

var viewModelList = [];

function ViewModel(el, data, children) {
    if (el !== false) viewModelList.push(this);

    if ((typeof data === 'undefined' || $.isArray(data)) && (el == undefined || $.isPlainObject(el)))
        children = data, data = el, el = this.el;

    this.children = [].concat(children);

    this.updateView = this.updateView.bind(this);
    this._handleEvent = this._handleEvent.bind(this);

    this.cid = util.guid();
    this.snModelKey = 'sn-' + this.cid + 'model';

    this.data = $.extend({}, this.defaultData, data);
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

    this.initialize.call(this, data);
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

    //事件处理
    _handleEvent: function (e) {
        if (e.type == $.fx.transitionEnd && e.target != e.currentTarget) {
            return;
        }
        var target = e.currentTarget;
        var eventCode = target.getAttribute('sn-' + this.cid + e.type);
        var fn;
        var ctx;

        if (eventCode == 'false') {
            return false;

        } else if (/^\d+$/.test(eventCode)) {

            var snData = this.formatData(target.snData);

            snData.e = e;

            return this.fns[eventCode].call(this, snData);
        }
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
                el.textContent = '';
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

                if (attr == 'sn-display' || attr == 'sn-html' || attr == 'sn-if' || attr == 'sn-style' || attr == "sn-data" || attr.indexOf('sn-') != 0) {
                    if (attr.indexOf('sn-') == 0 && (val.indexOf("{") == -1 || val.indexOf("}") == -1)) {
                        val = '{' + val + '}';
                    }
                    var fid = self.getFunctionId(val);

                    if (attr == "sn-data" && fid) {
                        el.setAttribute(attr, fid.id);

                    } else if (fid) {
                        if (attr == 'sn-if') {
                            el.style.display = 'none';
                        }

                        (el.snBinding || (el.snBinding = {}))[attr] = fid.id;
                        el.snIsGlobal = fid.isGlobal;
                    } else if (attr == "ref") {

                        self.refs[val] = el;
                    }

                } else if (attr == 'sn-model') {
                    el.removeAttribute(attr);
                    el.setAttribute(self.snModelKey, val);

                } else if (attr == 'sn-require') {
                    el.snRequire = require(val) || val;

                } else {
                    //处理事件绑定
                    var origAttr = attr;

                    attr = attr.replace(/^sn-/, '');

                    var evt = ModelEvents[attr];

                    if (evt) {
                        el.removeAttribute(origAttr);

                        attr = "sn-" + self.cid + evt;

                        if (rset.test(val) || rfunc.test(val)) {
                            var content = val.replace(rfunc, function (match, $1, $2) {

                                if (/^(Math\.|encodeURIComponent\(|parseInt\()/.test($1)) {
                                    return match;
                                }
                                return $1 + $2 + ($2 ? ',e)' : 'e)');

                            }).replace(rset, 'this._updateElementData(e.currentTarget,"$1",$2)');

                            var fid = self.getFunctionId('{' + content + '}');
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
        var data = Object.assign({
            $global: this.$global.data

        }, Filters, this.data);

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

            switch (attr) {
                case 'textContent':
                    if (typeof val == 'object') {
                        if (val.nodeType) {
                            if (el.nextSibling != val) {
                                $(val).insertAfter(el);
                            }

                        } else if ($.isArray(val)) {
                            var firstChild = val[0];
                            if (firstChild && el.nextSibling != firstChild)
                                val.forEach(function (item) {
                                    $(item).insertAfter(el);
                                });
                        }

                    } else
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
                            if (!el.snIf) {
                                var snIf = el.snIf = document.createComment('if');
                                el.parentNode.insertBefore(snIf, el);
                                snIf.snIfOrigin = el;
                            }
                            el.parentNode.removeChild(el);
                        }

                    } else {
                        if (!el.parentNode) {
                            el.snIf.nextSibling
                                ? el.snIf.parentNode.insertBefore(el, el.snIf.nextSibling)
                                : el.snIf.parentNode.appendChild(el);
                        }
                        if (el.style.display == 'none') el.style.display = '';
                    }
                    break;
                case 'display':
                    el.style.display = util.isFalse(val) ? 'none' : val == 'block' || val == 'inline' || val == 'inline-block' ? val : '';
                    break;
                case 'sn-display':
                    var display = util.isFalse(val) ? 'none' : val == 'block' || val == 'inline' || val == 'inline-block' ? val : '';
                    if (display == 'none') {
                        $(el).animate({
                            opacity: 0

                        }, 'ease-out', 200, function () {
                            el.style.display = display;
                        });
                    } else {
                        $(el).css({
                            display: display,
                            opacity: 0
                        });

                        el.clientHeight;

                        $(el).animate({
                            opacity: 1

                        }, 'ease-out', 200, function () {
                        })
                    }
                    break;
                case 'sn-style':
                    el.style.cssText += val;
                    break;
                case 'style':
                    el.style.cssText = val;
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
                case 'className':
                    el.className = val;
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
                        if (parentNode.snRepeatSource == repeatSource.parent && parentNode.snData) {
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
        console.time('updateView')

        var self = this;

        this.refs = {};

        eachElement(this.$el, function (el) {
            if (el.snViewModel && el.snViewModel != self) return false;

            return updateElement(self, el);
        });

        console.timeEnd('updateView');

        if (this.parents) {
            this.parents.forEach(function (parent) {
                !parent._nextTick && parent.updateView();
            })
        }

        this._nextTick = null;
        this.trigger('viewDidUpdate');
    },

    bind: function (el) {
        var self = this;
        var $el = $(el).on('input change blur', '[' + this.snModelKey + ']', function (e) {
            var target = e.currentTarget;

            self._updateElementData(target, target.getAttribute(self.snModelKey), target.value);
        });

        this._bindElement($el);

        self.$el = !self.$el ? $el : self.$el.add($el);

        $el.each(function () { this.snViewModel = self; })

        return this;
    },

    _bindElement: function ($el) {
        var self = this;

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

        for (var key in ModelEvents) {
            var eventName = ModelEvents[key];
            var attr = '[sn-' + self.cid + eventName + ']';

            $el.on(eventName, attr, this._handleEvent)
                .filter(attr)
                .on(eventName, this._handleEvent);
        }

        var fns = new Function('return [' + this._codes.join(',') + ']')();

        fns.forEach(function (fn) {
            self.fns.push(fn);
        });
    },

    _bindNewNode: function (newNode) {

        newNode = $(newNode);

        newNode.each(function () {
            if (this.snViewModel)
                throw new Error("can not insert or append binded node!");
        });

        this._bindElement(newNode);

        this.updateViewNextTick();

        return newNode;
    },

    _checkOwnNode: function (node) {
        if (typeof node == 'string') {
            node = this.$el.find(node);

            if (!node.length)
                throw new Error('is not own node');

        } else {

            this.$el.each(function () {
                if (!$.contains(this, node))
                    throw new Error('is not own node');
            });
        }
        return node;
    },

    isOwnNode: function (node) {
        if (typeof node == 'string') {
            return !this.$el.find(node).length;

        } else {
            var flag = true;
            this.$el.each(function () {
                if (!$.contains(this, node)) return false;
            });
            return flag;
        }
    },

    before: function (newNode, referenceNode) {

        referenceNode = this._checkOwnNode(referenceNode);

        return this._bindNewNode(newNode)
            .insertBefore(referenceNode);
    },

    after: function (newNode, referenceNode) {
        referenceNode = this._checkOwnNode(referenceNode);

        return this._bindNewNode(newNode)
            .insertAfter(referenceNode);
    },

    append: function (newNode, parentNode) {
        parentNode = this._checkOwnNode(parentNode);

        return this._bindNewNode(newNode)
            .appendTo(parentNode);
    },

    prepend: function (newNode, parentNode) {
        parentNode = this._checkOwnNode(parentNode);

        return this._bindNewNode(newNode)
            .prependTo(parentNode);
    },

    next: function (callback) {
        return this.one('viewDidUpdate', callback);
    },

    destory: function () {
        this.$el.off('input change blur', '[' + this.snModelKey + ']')
            .each(function () {
                this.snViewModel = null;
            });

        for (var key in ModelEvents) {
            var eventName = ModelEvents[key];
            var attr = '[sn-' + this.cid + eventName + ']';

            this.$el.off(eventName, attr, this._handleEvent);
        }

        for (var i = 0, len = viewModelList.length; i < len; i++) {
            if (viewModelList[i] == this) {
                viewModelList.splice(i, 1);
                break;
            }
        }

        this.$el = null;
    }

});

Event.mixin(ViewModel);

ViewModel.extend = util.extend;

var Global = ViewModel.prototype.$global = new ViewModel();

Global.updateView = (function () {

    viewModelList.forEach(function (viewModel) {
        var refs = {};

        eachElement(viewModel.$el, function (el) {
            if (el.snViewModel && el.snViewModel != viewModel) return false;

            if (el.snIsGlobal) {
                if (el.nodeType == 1) {
                    var ref = el.getAttribute('ref');
                    if (ref && !refs[ref]) {
                        viewModel.refs[ref] = null;
                        refs[ref] = true;
                    }
                }
                return updateElement(viewModel, el);
            }
        });

    });

    this._nextTick = null;

}).bind(Global);


exports.Filters = Filters;
exports.ViewModel = exports.Model = ViewModel;
exports.Global = Global;
exports.Collection = Collection;

exports.createModel = function (props) {
    return Object.assign(new ViewModel, props)
}

exports.createCollection = function (props) {
    return Object.assign(new Collection, props)
}