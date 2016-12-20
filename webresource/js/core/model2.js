var $ = require('$');
var Base = require('./base');
var util = require('util');
var Event = require('./event');

util.style('.sn-display { opacity: 1; -webkit-transition: opacity 300ms ease-out 0ms; transition: opacity 300ms ease-out 0ms; }\
.sn-display-show { opacity: 1; }\
.sn-display-hide { opacity: 0; }');

var toString = {}.toString;
var LINKEDCHANGE = 'linkedchange';

var EVENTS = {
    tap: 'tap',
    'long-tap': 'longTap',
    'transition-end': $.fx.transitionEnd,
    touchstart: 'touchstart',
    touchend: 'touchend',
    touchmove: 'touchmove',
    click: 'click',
    load: 'load',
    error: 'error',
    change: 'change',
    input: 'input',
    focus: 'focus',
    blur: 'blur'
};
var GLOBAL_VARIABLES = {
    'new': true,
    'this': true,
    '$': true,
    "sl": true,
    'util': true,
    "JSON": true,
    'Math': true,
    'Date': true,
    'encodeURIComponent': true,
    'decodeURIComponent': true,
    'window': true,
    'document': true
};

var rfilter = /\s*\|\s*([a-zA-Z_0-9]+)((?:\s*(?:\:|;)\s*\({0,1}\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)/g;
var rvalue = /^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/;
var rrepeat = /([$a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([$a-zA-Z_0-9]+(?:\.[$a-zA-Z_0-9\(\,\)]+){0,})(?:\s*\|\s*filter\s*\:\s*(.+?)){0,1}(?:\s*\|\s*orderBy\:(.+)){0,1}(\s|$)/;
var rmatch = /\{\s*(.+?)\s*\}(?!\s*\})/g;
var rvar = /(?:\{|,)\s*[$a-zA-Z0-9]+\s*\:|'(?:\\'|[^'])*'|"(?:\\"|[^"])*"|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/[img]*(?=[\)|\.|,])|\/\/.*|\bvar\s+[_,a-zA-Z0-9]+\s*\=|(^|[\!\=\>\<\?\s\:\(\),\%&\|\+\-\*\/\[\]]+)([\$a-zA-Z_][\$a-zA-Z_0-9]*(?:\.[a-zA-Z_0-9]+)*(?![a-zA-Z_0-9]*\())/g;
var rset = /([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+)*)\s*=\s*((?:\((?:'(?:\\'|[^'])*'|[^\)])+\)|'(?:\\'|[^'])*'|[^;])+?)(?=\;|\,|\)|$)/g;
var rfunc = /\b((?:this\.){0,1}[\.\w]+\()((?:'(?:\\'|[^'])*'|\((?:\((?:\((?:\(.*?\)|.)*?\)|.)*?\)|[^\)])*\)|[^\)])*)\)/g;
var rSnAttr = /^sn-/;

//var rfunc = /\b((?:this\.){0,1}[\.\w]+\()((?:'(?:\\'|[^'])*'|[^\)])*)\)/g;
//   /(?:\((?:\(.*?\)|.)*?\)|.)/

var Filters = {
    contains: function(source, keywords) {
        return source.indexOf(keywords) != -1;
    },
    like: function(source, keywords) {
        source = source.toLowerCase();
        keywords = keywords.toLowerCase();
        return source.indexOf(keywords) != -1 || keywords.indexOf(source) != -1;
    },
    util: util
};

var FILTERS_VARS = (function() {
    var res = '';
    for (var key in Filters) {
        res += 'var ' + key + '=$data.' + key + ';';
    }
    return res;
})();

function testRegExp(regExp, val) {
    return regExp.lastIndex != 0 && (regExp.lastIndex = 0) || regExp.test(val);
}

function valueCode(str, variables) {
    var arr = str.split('.');
    var alias = arr[0];
    var result = [];
    var code = '';
    var gb = '$data';

    if (!alias || GLOBAL_VARIABLES[alias] || rvalue.test(str) || (variables && variables.indexOf(alias) != -1) || alias in Filters) {
        return str;

    } else if (alias == 'delegate') {
        return 'this.' + str;
    }

    str = gb + '.' + str;

    for (var i = 0; i < arr.length; i++) {
        result[i] = (i == 0 ? gb : result[i - 1]) + '.' + arr[i];
    }
    for (var i = 0; i < result.length; i++) {
        code += (i ? '&&' : '') + result[i] + '!==null&&' + result[i] + '!==undefined';
    }
    //typeof ' + str + '==="function"?' + str + '():
    return '((' + code + ')?' + str + ':"")';
}

function eachElement(el, fn) {
    if (!el) return;

    if (Array.isArray(el) || el instanceof $.fn.constructor) {
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

        } else if (flag && flag.nextSibling) {
            nextSibling = flag.nextSibling;
            flag = flag.isSkipChildNodes === true ? false : true;

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

            viewModel.refs[refName] = el.snRepeatSource || closestElement(el, function(parentNode) {
                return parentNode.snRepeatSource ? true : parentNode.snViewModel ? false : null;

            }) ? [ref] : ref;

        } else if (refs.nodeType) {
            viewModel.refs[refName] = [refs, ref];

        } else {
            refs.push(ref);
        }
    }
}

function updateRequireView(viewModel, el) {
    var id = el.getAttribute('sn-data');
    var data = !id ? null : viewModel.executeFunction(id, viewModel.formatData(el.snData, el));
    var instance;

    if (el.snRequireInstance) {
        instance = el.snRequireInstance;
        if (data && !util.equals(data, instance._originData)) {
            instance._originData = data;
            instance.set(data);
        }

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

        instance._originData = data;

        instance.$el.appendTo(el);
    }
    setRefs(viewModel, el);
}

function updateNode(viewModel, el) {
    if (el.nodeType == 8 && el.snRepeatSource) {
        viewModel.updateRepeatElement(el);

    } else if (el.snIfOrigin) {
        return {
            isSkipChildNodes: true,
            nextSibling: el.snIfOrigin
        };

    } else {
        el.snBinding && viewModel.updateNode(el);

        if (el.nodeType == 1) {

            if (el.snIf) {
                if (!el.parentNode) {
                    return {
                        isSkipChildNodes: true,
                        nextSibling: el.snIf.nextSibling
                    };

                } else {
                    if (el.snRequire) updateRequireView(viewModel, el);
                    else setRefs(viewModel, el);

                    var nextElement = el.nextSibling;
                    var currentElement = el;

                    while (nextElement) {

                        if (nextElement.nodeType === 3) {
                            nextElement = nextElement.nextSibling;
                            continue;
                        }

                        if (!nextElement.snIf && !nextElement.snIfOrigin || nextElement.snIfType == 'sn-if') {
                            break;
                        }

                        switch (nextElement.snIfType) {
                            case 'sn-else':
                            case 'sn-else-if':

                                if (nextElement.snIf) {
                                    nextElement.parentNode.removeChild(nextElement);
                                    currentElement = nextElement.snIf;

                                } else {
                                    currentElement = nextElement;
                                }
                                break;
                            default:
                                throw new Error(nextElement.snIfType, ':snIfType not available');
                                break;
                        }
                        nextElement = currentElement.nextSibling;
                    }

                    return currentElement.nextSibling;
                }
            } else if (el.snRequire) {
                updateRequireView(viewModel, el);
            } else {
                setRefs(viewModel, el);
            }
        }

    }
}

function cloneRepeatElement(source, snData) {
    return cloneElement(source, function(node, clone) {

        clone.snData = snData;
        clone.snIsGlobal = node.snIsGlobal;

        if (node.snRepeatSource) {
            clone.snRepeatSource = node.snRepeatSource;
        }
        if (node.snBinding) {
            clone.snBinding = node.snBinding;
        }
        if (node.snIfOrigin) {

            clone.snIfOrigin = cloneRepeatElement(node.snIfOrigin, snData);
            clone.snIfType = clone.snIfOrigin.snIfType = node.snIfType;
            clone.snIfOrigin.snIf = clone;
        }
    });
}

function cloneElement(el, fn) {

    eachElement(el, function(node) {
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
        var res = fn(parentNode, el);
        if (res === true) {
            return parentNode;
        } else if (res === false) {
            break;
        }
    }
    return null;
}

function linkModels(model, value, key) {
    var root = model.root;

    var link = {
        childModelKey: key,
        childModel: value,
        childRoot: value.root,
        model: model,
        cb: function() {

            root.updateViewNextTick();
        }
    };

    value.root.on(LINKEDCHANGE + ":" + value.cid, link.cb);

    (value._linkedParents || (value._linkedParents = [])).push(link);
    (root._linkedModels || (root._linkedModels = [])).push(link);
}

function unlinkModels(model, value) {
    var root = model.root;
    var link;
    var linkedModels = root._linkedModels;
    var linkedParents = value._linkedParents;
    if (linkedModels && linkedParents) {

        for (var i = linkedModels.length - 1; i >= 0; i--) {
            link = linkedModels[i];
            if (link.model == model && link.childModel == value) {
                linkedModels.splice(i, 1);
                linkedParents.splice(linkedParents.indexOf(link));
                value.root.off(LINKEDCHANGE + ":" + value.cid, link.cb);
                break;
            }
        }
    }
}


function genFunction(expression) {
    if (!testRegExp(rmatch, expression)) return;

    var variables;
    var isGlobal = false;

    var content = FILTERS_VARS + 'try{return \'' +
        expression
            .replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
            .replace(rmatch, function(match, exp) {

                return '\'+(' +
                    exp.replace(/\\\\/g, '\\')
                        .replace(/\\'/g, '\'')
                        .replace(rvar, function(match, prefix, name) {
                            if (!name) {
                                if (match.indexOf('var ') == 0) {
                                    return match.replace(/var\s+([^\=]+)\=/, function(match, $0) {
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
                        }) +
                    ')+\'';
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

    if (parent instanceof Collection) {
        var index = parent.indexOf(model);
        if (index != -1) {
            parent.data[index] = model.data;
        }

    } else {
        parent.data[model._key] = model.data;
    }

}

function setModelByKeys(model, cover, keys, val) {
    var lastKey = keys.pop();
    var tmp;

    for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];

        if (!(model.model[key] instanceof Model)) {
            tmp = model.model[key] = new Model(model, key, {});
            model.data[key] = tmp.data;

            model = tmp;

        } else {
            model = model.model[key];
        }
    }
    return model.set(cover, lastKey, val);
}

function changedAndUpdateViewNextTick(model) {
    if (model.changed) return;

    model.changed = true;

    if (model.parent instanceof Collection) {
        changedAndUpdateViewNextTick(model.parent);
    }

    model.root.one('datachanged', function() {
        model.changed = false;

        model.key && model.root.trigger("datachanged:" + model.key);

        model._linkedParents && model._linkedParents.length && model.root.trigger(LINKEDCHANGE + ":" + model.cid);

    }).updateViewNextTick();
}

var Model = function(parent, key, data) {

    if (parent instanceof Model) {
        this.key = parent.key ? parent.key + '.' + key : key;
        this._key = key;

    } else if (parent instanceof Collection) {
        this.key = parent.key + '^child';
        this._key = parent._key + '^child';

    } else {
        throw new Error('Model\'s parent mast be Collection or Model');
    }

    this.cid = util.guid();

    this.type = typeof data == 'object' ? 'object' : 'value';
    this.data = this.type == 'object' ? $.extend({}, data) : data;

    this.model = {};
    this.parent = parent;
    this.root = parent.root;
    this.changed = false;

    this.set(data);
}


var RE_QUERY = /(?:^|\.)([_a-zA-Z0-9]+)(\[(?:'(?:\\'|[^'])*'|"(?:\\"|[^"])*"|[^\]])+\](?:\[[\+\-]?\d*\])?)?/g;
var RE_COLL_QUERY = /\[((?:'(?:\\'|[^'])*'|"(?:\\"|[^"])*"|[^\]])+)\](?:\[([\+\-]?)(\d+)?\])?(?:\.(.*))?/;


// var a = util.query("attr^='somevalue'|c1=1,att2!=2")({
//     attr: 'somevalue11'
// });

// console.log(a);

// var a = "someattr.collection[attr^='somevalue',att2=2][1].aaa[333]";

// var attr;
// var query;

// RE_QUERY.lastIndex = -1;
// for (var m = RE_QUERY.exec(a); m; m = RE_QUERY.exec(a)) {
//     attr = m[1];
//     query = m[2];

//     console.log(attr, query, a.substr(m.index + m[0].length))
// }

// console.log("[attr^='somevalue',att2=2][+1].aaa[333]".match(RE_COLL_QUERY));


var ModelProto = {

    //@key=someattr.collection[attr^='somevalue'|1=1,att2=2]
    // console.log(model._('c[id=222][0].options[text~="aa"&value="1"][0]'))
    _: function(search, def) {

        var attr;
        var query;
        var result = this;

        RE_QUERY.lastIndex = -1;
        for (var m = RE_QUERY.exec(search); m; m = RE_QUERY.exec(search)) {
            attr = m[1];
            query = m[2];

            if (result instanceof Model) {
                result = result.model[attr];

                if (query && result instanceof Collection) {
                    return result._(query + search.substr(m.index + m[0].length), def);
                }
            }
            else if (!result)
                return def === undefined ? null : def;
            else
                result = result[attr]
        }
        return !result && def !== undefined ? def : result;
    },

    findByKey: function(key) {
        if (this.key == key) return this;

        var models = this.model;
        var model;

        while (1) {
            var flag = false;

            for (var modelKey in models) {
                model = models[modelKey];

                if (model instanceof Model || model instanceof Collection) {

                    if (model.key == key) {
                        return model;

                    } else {
                        var linkedParents = model._linkedParents;
                        if (linkedParents && linkedParents.length) {

                            for (var i = 0, len = linkedParents.length; i < len; i++) {
                                var childModelKey = linkedParents[i].childModelKey;
                                if (key == childModelKey) {
                                    return model;

                                } else if (key.indexOf(childModelKey + '.') == 0) {
                                    flag = true;
                                    key = key.substr(childModelKey.length + 1);
                                    break;
                                }
                            }

                        } else if (key.indexOf(model.key + '.') == 0) {
                            flag = true;
                        }
                    }

                    if (flag && model.model) {
                        models = model.model;
                        break;
                    }
                }
            }

            if (!flag) break;
        }

        return null;
    },

    get: function(key) {
        if (typeof key === 'undefined')
            return this.data === null ? null : typeof data == 'object' ? $.extend(true, {}, this.data) : this.data;

        if (typeof key == 'string' && key.indexOf('.') != -1) {
            key = key.split('.');
        }

        var data;
        if (Array.isArray(key)) {
            data = this.data;

            for (var i = key[0] == 'this' ? 1 : 0, len = key.length; i < len; i++) {
                if (!(data = data[key[i]]))
                    return null;
            }

        } else if (key == 'this') {
            return this.data;

        } else {
            data = this.data[key];
        }

        return data === null ? null : typeof data == 'object' ? $.extend(true, Array.isArray(data) ? [] : {}, data) : data;
    },

    //[cover,object]|[cover,key,val]|[key,va]|[object]
    //@cover=true|false 是否覆盖数据，[cover,key,val]时覆盖子model数据,[cover,object]时覆盖当前model数据
    set: function(cover, key, val) {
        var self = this,
            model,
            origin,
            changed,
            attrs,
            parent,
            keys,
            coverChild = false,
            root = this.root;

        if (typeof cover != "boolean")
            val = key, key = cover, cover = false;

        var isArrayKey = $.isArray(key);

        if (!isArrayKey && typeof key == 'object') {
            attrs = key;

        } else if (key === null) {
            !cover && (cover = true);
            attrs = {};

        } else if (typeof val == 'undefined') {
            val = key;
            key = '';

            if (this.data != val) {
                this.data = val;

                syncParentData(this);

                changedAndUpdateViewNextTick(this);
            }
            return this;

        } else {
            keys = isArrayKey ? key : key.split('.');

            if (keys.length > 1) {
                model = setModelByKeys(this, cover, keys, val);

                if (model.changed) {
                    changedAndUpdateViewNextTick(this);
                }
                return this;

            } else {
                coverChild = cover;
                cover = false;
                (attrs = {})[key] = val;
            }
        }
        if (this.data === null || !$.isPlainObject(this.data)) this.data = {}, syncParentData(this);

        var data = this.data;
        model = this.model;

        if (cover) {
            for (var attr in data) {
                if (attrs[attr] === undefined) {
                    attrs[attr] = null;
                }
            }
        }

        var hasChange = false;
        var valueType;
        var changes = [];

        for (var attr in attrs) {
            origin = model[attr];
            value = attrs[attr];

            if (origin !== value) {
                if (value instanceof Model || value instanceof Collection) {
                    model[attr] = value;
                    data[attr] = value.data;

                    if (origin instanceof Model || origin instanceof Collection) {
                        unlinkModels(self, origin);
                    }

                    linkModels(self, value, model.key ? model.key + '.' + attr : attr);

                    hasChange = true;

                } else if (origin instanceof Model) {
                    value === null || value === undefined ? origin.reset() : origin.set(coverChild, value);
                    data[attr] = origin.data;

                    if (!hasChange && origin.changed) hasChange = true;

                } else if (origin instanceof Collection) {
                    if (!Array.isArray(value)) {
                        if (value == null) {
                            value = [];
                        } else {
                            throw new Error('[Array to ' + (typeof value) + ' error]不可改变' + attr + '的数据类型');
                        }
                    }

                    origin.set(value);
                    data[attr] = origin.data;

                    if (!hasChange && origin.changed) hasChange = true;

                } else {
                    valueType = value === null || value === undefined ? null : toString.call(value);

                    switch (valueType) {
                        case '[object Object]':
                            value = new Model(this, attr, value);
                            model[attr] = value;
                            data[attr] = value.data;
                            break;

                        case '[object Array]':
                            value = new Collection(this, attr, value);
                            model[attr] = value;
                            data[attr] = value.data;
                            break;

                        default:
                            data[attr] = model[attr] = value;
                            changes.push(this.key ? this.key + "." + attr : attr, value);
                            break;
                    }

                    if (!hasChange) hasChange = true;
                }
            }
        }

        if (hasChange) {
            changedAndUpdateViewNextTick(this);

            for (var i = 0, length = changes.length; i < length; i += 2) {
                root.trigger("change:" + changes[i], changes[i + 1]);
            }
        }

        return self;
    },

    reset: function() {
        var data = {};
        for (var attr in this.data) {
            data[attr] = null;
        }
        this.set(data);
    }
}
ModelProto.getModel = ModelProto._;

Model.prototype = ModelProto;

var Collection = function(parent, attr, data) {
    if (Array.isArray(parent)) {
        data = parent;
        parent = null;
    }
    if (!parent) {
        parent = new ViewModel(false);
    }
    if (!attr) {
        attr = "$list";
    }

    this.parent = parent;
    this.key = parent.key ? (parent.key + "." + attr) : attr;
    this._key = attr;

    this.root = parent.root;
    this.changed = false;

    this.data = [];
    parent.data[attr] = this.data;

    data && this.add(data);
}

Collection.prototype = {

    length: 0,

    size: function() {
        return this.data.length;
    },

    map: function(fn) {
        return util.map(this.getAll(), fn);
    },

    indexOf: function(key, val) {
        return key instanceof Model ? Array.prototype.indexOf.call(this, key) :
            util.indexOf(this.data, key, val);
    },

    lastIndexOf: function(key, val) {
        return key instanceof Model ? Array.prototype.lastIndexOf.call(this, key) :
            util.lastIndexOf(this.data, key, val);
    },

    getAll: function() {
        return $.extend(true, [], this.data);
    },

    get: function(i) {
        if (i == undefined) return this.getAll();

        return this[i].get();
    },

    //@search= n /*第n个*/ | "[attr='val']"/*查询所有*/ | "[attr='val'][n]"/*查询并返回第n个*/ | 
    // "[attr='val'][+]"/*一个都不存在则添加*/ | "[attr='val'][+n]"/*结果小于n个则添加*/ |
    // "[attr='val'][-]"/*删除全部，并返回被删除的*/ | "[attr='val'][-n]"/*删除第n个，并返回被删除的*/
    _: function(search, def) {

        console.log(search)

        if (typeof search == 'number' || /^\d+$/.test(search))
            return this[search];

        var match = search.match(RE_COLL_QUERY);

        var query = match[1];
        var next = match[4];
        var model;

        if (/^\d+$/.test(query))
            return (model = this[query]) ? (next ? model : model._(next)) : null;

        var operation = match[2];
        var index = match[3] ? parseInt(match[3]) : operation == '+' ? 0 : undefined;

        var test = util.query(query);
        var data = this.data;


        //移除操作
        if (operation == '-') {
            var j = 0;
            var results = [];
            var from = index === undefined ? 0 : index;
            var to = index === undefined ? data.length : index;

            for (var i = 0, n = data.length; i < n; i++) {
                if (test(data[i])) {

                    if (j >= from && j <= to) {

                        model = this.splice(i, 1)[0];

                        results.push(next ? model._(next) : model);
                    }

                    j++;
                }
            }
            return results;

        } else if (index === undefined) {

            //根据条件查询
            var results = [];
            for (var i = 0, n = data.length; i < n; i++) {
                if (test(data[i])) {

                    results.push(next ? this[i]._(next) : this[i]);
                }
            }
            return results;

        } else {

            //根据条件查询，并返回第n个结果
            var j = 0;
            for (var i = 0, n = data.length; i < n; i++) {
                if (test(data[i])) {
                    if (j === index) {
                        return next ? this[i]._(next) : this[i];
                    }
                    j++;
                }
            }
            return operation == '+' ? this.add(def ? def : {}) : null;
        }
    },

    set: function(data) {

        if (!data || data.length == 0) {
            this.clear();

        } else {
            var modelsLen = this.length;

            if (data.length < modelsLen) {
                this.splice(data.length, modelsLen - data.length)
            }

            var i = 0;
            var hasChange = this.changed;
            var item;

            this.each(function(model) {
                item = data[i];

                if (item instanceof Model) {

                    if (item != model) {
                        if (!hasChange) {
                            hasChange = true;
                        }
                        unlinkModels(this, model);
                        linkModels(this, item, this.key + '^child');

                        this[i] = item;
                        this.data[i] = item.data;
                    }

                } else {
                    model.set(true, item);
                    if (!hasChange && model.changed) {
                        hasChange = true;
                    }
                }

                i++;
            });

            this.add(i == 0 ? data : data.slice(i, data.length));

            if (!this.changed && hasChange) {
                changedAndUpdateViewNextTick(this);
            }
        }
        return this;
    },


    add: function(data) {
        var model;
        var isArray = Array.isArray(data);

        if (!isArray) {
            data = [data];
        }
        var dataLen = data.length;
        var results = [];

        if (dataLen) {
            for (var i = 0; i < dataLen; i++) {
                var dataItem = data[i];

                if (dataItem instanceof Model) {

                    linkModels(this, dataItem, this.key + '^child');
                    model = dataItem;
                } else {
                    model = new Model(this, this.length, dataItem);
                }

                this[this.length++] = model;
                this.data.push(model.data);

                results.push(model);
            }

            changedAndUpdateViewNextTick(this);
        }
        return isArray ? results : results[0];
    },

    //@updateType=undefined:collection中存在既覆盖，不存在既添加|true:根据arr更新，不在arr中的项将被删除|false:只更新collection中存在的
    update: function(arr, primaryKey, updateType) {
        if (typeof arr === 'boolean')
            arr = [arr, primaryKey, updateType], updateType = arr[0], primaryKey = arr[2], arr = arr[1];

        if (!arr) return this;

        var fn;
        var length = this.length;

        if (!length) {
            (updateType !== false) && this.add(arr);

            return this;
        }

        if (typeof primaryKey === 'string') {
            fn = function(a, b) {
                return a[primaryKey] == b[primaryKey];
            }
        } else fn = primaryKey;

        var item;
        var arrItem;
        var exists;

        if (!Array.isArray(arr)) arr = [arr];
        else arr = [].concat(arr);

        var n = arr.length;
        var result;

        for (var i = length - 1; i >= 0; i--) {
            item = this.data[i];
            exists = false;

            for (var j = 0; j < n; j++) {
                arrItem = arr[j];

                if (arrItem !== undefined) {
                    if (result = fn.call(this, item, arrItem)) {
                        this[i].set(typeof result == 'object' ? result : arrItem);
                        arr[j] = undefined;
                        exists = true;
                        break;
                    }
                }
            }

            if (updateType === true && !exists) {
                this.splice(i, 1);
            }
        }

        if (updateType !== false) {
            var appends = [];
            for (var i = 0, n = arr.length; i < n; i++) {
                if (arr[i] !== undefined) {
                    appends.push(arr[i]);
                }
            }

            if (appends.length) {
                this.add(appends);
            }
        }

        return this;
    },

    unshift: function(data) {
        this.insert(0, data);
    },

    insert: function(index, data) {

        var model;
        var count;

        if (!$.isArray(data)) {
            data = [data];
        }

        for (var i = 0, dataLen = data.length; i < dataLen; i++) {
            var dataItem = data[i];

            if (dataItem instanceof Model) {
                model = dataItem;
                linkModels(this, model, this.key + '^child');
            } else {
                count = index + i;
                model = new Model(this, count, dataItem);
            }

            Array.prototype.splice.call(this, count, 0, model)

            this.data.splice(count, 0, model.data);
        }

        changedAndUpdateViewNextTick(this);
    },

    splice: function(start, count, data) {
        if (!count) count = 1;
        var root = this.root;
        var spliced = Array.prototype.splice.call(this, start, count);
        if (root._linkedModels) {
            var self = this;

            spliced.forEach(function(model) {
                model._linkedParents && unlinkModels(self, model);
            });
        }

        this.data.splice(start, count);

        if (data)
            this.insert(start, data);
        else
            changedAndUpdateViewNextTick(this);

        return spliced;
    },

    //@[key,val]|function(){return true|false;}|Model
    remove: function(key, val) {
        var fn;

        if (typeof key === 'string' && val !== undefined) {
            fn = function(item) {
                return item[key] == val;
            }

        } else if (key instanceof Model) {
            fn = function(item, i) {
                return this[i] == key;
            }

        } else fn = key;

        for (var i = this.length - 1; i >= 0; i--) {
            if (fn.call(this, this.data[i], i)) {
                Array.prototype.splice.call(this, i, 1);
                this.data.splice(i, 1);
            }
        }

        changedAndUpdateViewNextTick(this);
    },

    clear: function() {
        if (this.length == 0 && this.data.length) return;
        for (var i = 0; i < this.length; i++) {
            delete this[i];
        }
        this.length = this.data.length = 0;

        changedAndUpdateViewNextTick(this);
    },

    each: function(start, end, fn) {

        if (typeof start == 'function') fn = start, start = 0, end = this.length;
        else if (typeof end == 'function') fn = end, end = this.length;

        for (; start < end; start++) {
            if (fn.call(this, this[start], start) === false) break;
        }
        return this;
    },

    find: function(key, val) {
        var fn;

        if (typeof key === 'string' && val !== undefined) {
            fn = function(item) {
                return item[key] == val;
            }
        } else fn = key;

        for (var i = 0; i < this.length; i++) {
            if (fn.call(this, this.data[i], i)) {
                return this[i];
            }
        }
        return null;
    },

    filter: function(key, val) {
        return util.filter(this.data, key, val);
    }
}


function RepeatSource(viewModel, el, parent) {
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
    this.attrs = attrs;
    this.parentAlias = parentAlias;

    var orderByCode = match[5];
    if (orderByCode) {
        if (orderByCode.indexOf('this.') == 0) {
            self.orderBy = orderByCode.substr(5).replace(/\(.*\)/, '');

        } else {
            self.orderBy = [];

            orderByCode.split(/\s*,\s*/).forEach(function(sort) {
                sort = sort.split(' ');
                var sortKey = sort[0];
                var sortType = sort[1];

                if (sortKey.charAt(0) == '{' && sortKey.charAt(sortKey.length - 1) == '}') {
                    sortKey = viewModel.createFunction(sortKey).id;
                }

                if (sortType.charAt(0) == '{' && sortType.charAt(sortType.length - 1) == '}') {
                    sortType = viewModel.createFunction(sortType).id;

                } else {
                    sortType = sortType == 'desc' ? false : true;
                }

                self.orderBy.push(sortKey, sortType);
            });
        }

    }

    var replacement = document.createComment(collectionKey);
    replacement.snRepeatSource = this;
    el.parentNode.replaceChild(replacement, el);

    this.replacement = replacement;

    parent && parent.appendChild(this);

    if (parentAlias == '$global') {
        this.isGlobal = true;

        attrs.shift();
        collectionKey = attrs.join('.');

    } else if (parentAlias == 'this') {
        this.isFn = true;
        this.fid = viewModel.createFunction('{' + collectionKey + '}').id;

        collectionKey = collectionKey.replace(/\./g, '/');

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

RepeatSource.isRepeatNode = function(node) {
    return node.nodeType == 1 && node.getAttribute('sn-repeat');
}

RepeatSource.prototype.appendChild = function(child) {
    this.children.push(child);
}

var viewModelList = [];

function ViewModel(el, data, children) {
    if (el !== false) viewModelList.push(this);

    if ((typeof data === 'undefined' || $.isArray(data)) && (el === undefined || el === null || $.isPlainObject(el)))
        children = data, data = el, el = this.el;

    this.children = children ? [].concat(children) : [];

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

var ViewModelProto = {

    getDataByElement: function(el, modelName) {
        var attrs = modelName.split('.');
        var model;

        if (el.snData && attrs[0] in el.snData) {
            model = el.snData[attrs.shift()];
        } else {
            model = this;
        }
        return model.get(attrs);
    },

    setDataByElement: function(el, modelName, value) {
        var attrs = modelName.split('.');
        var model;

        if (el.snData && attrs[0] in el.snData) {
            model = el.snData[attrs.shift()];
        } else {
            model = this;
        }

        model.set(attrs, value);
        return this;
    },

    //事件处理
    _handleEvent: function(e) {
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

            var snData = this.formatData(target, target.snData);

            snData.e = e;

            var res = this.executeFunction(eventCode, snData);

            return res;
        }
    },

    initialize: util.noop,

    observe: function(key, fn) {
        if (arguments.length == 1) {
            fn = key;
            key = '';
        } else {
            key = ':' + key;
        }

        return this.on('datachanged' + key, fn);
    },

    removeObserve: function(key, fn) {
        if (arguments.length == 1) {
            fn = key;
            key = '';
        } else {
            key = ':' + key;
        }

        return this.off('datachanged' + key, fn);
    },

    executeFunction: function(functionId, data) {
        return this.fns[functionId].call(this, data);
    },

    createFunction: function(expression) {
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

    twoWayBinding: function(el) {
        var self = this;

        if (el.nodeType == 3) {
            var fid = self.createFunction(el.textContent);

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

            if (val || attr == 'sn-else') {

                switch (attr) {
                    case 'sn-if':
                    case 'sn-else':
                    case 'sn-else-if':
                        var snIf = document.createComment(attr);
                        snIf.snIfOrigin = el;
                        el.snIf = snIf;
                        el.snIfType = snIf.snIfType = attr;
                        el.parentNode.insertBefore(snIf, el);
                        el.parentNode.removeChild(el);

                        if (attr == 'sn-else') {
                            (el.snBinding || (el.snBinding = {}))[attr] = attr;
                            break;
                        }

                    case 'sn-src':
                    case 'sn-html':
                    case 'sn-display':
                    case 'sn-style':
                    case "sn-data":
                        if (val.indexOf("{") == -1 || val.indexOf("}") == -1) {
                            val = '{' + val + '}';
                        }
                    case attr.replace(rSnAttr):
                        var fid = self.createFunction(val);

                        if (attr == "sn-data" && fid) {
                            el.setAttribute(attr, fid.id);

                        } else if (fid) {
                            (el.snBinding || (el.snBinding = {}))[attr] = fid.id;
                            el.snIsGlobal = fid.isGlobal;
                            el.removeAttribute(attr);

                        } else if (attr == "ref") {
                            self.refs[val] = el;
                        }
                        break;
                    case 'sn-model':
                        el.removeAttribute(attr);
                        el.setAttribute(self.snModelKey, val);
                        break;
                    case 'sn-require':
                        el.snRequire = require(val) || val;
                        break;
                    default:
                        //处理事件绑定
                        var origAttr = attr;

                        attr = attr.replace(/^sn-/, '');

                        var evt = EVENTS[attr];

                        if (evt) {
                            el.removeAttribute(origAttr);

                            attr = "sn-" + self.cid + evt;

                            var a = /\d+$/g;

                            if (testRegExp(rset, val) || testRegExp(rfunc, val)) {

                                var content = val.replace(rfunc, function(match, $1, $2) {

                                    if (/^(Math\.|encodeURIComponent\(|parseInt\()/.test($1)) {
                                        return match;
                                    }
                                    return $1 + $2 + ($2 ? ',e)' : 'e)');

                                })
                                    /*.replace(rset, function (match, $1, $2) {
                                                                        //test
                                                                        return match;

                                                                    })*/
                                    .replace(rset, 'this.setDataByElement(e.currentTarget,"$1",$2)');

                                var fid = self.createFunction('{' + content + '}');
                                if (fid) {
                                    el.setAttribute(attr, fid.id);
                                }

                            } else {
                                el.setAttribute(attr, val);
                            }
                        }
                        break;
                }
            }
        }
    },

    formatData: function(element, snData) {
        var data = Object.assign({
            $global: this.$global.data,
            srcElement: element

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

    updateNode: function(el, attribute) {
        var self = this;
        var attrsBinding;
        var data = this.formatData(el, el.snData);

        if (attribute)
            (attrsBinding = {})[attribute] = el.snBinding[attribute];
        else
            attrsBinding = el.snBinding;

        var attrs = el.snAttrs || (el.snAttrs = {});

        var keys = [];

        for (var key in attrsBinding) {
            switch (key) {
                case "sn-else":
                    if (!el.parentNode) {
                        el.snIf.nextSibling ?
                            el.snIf.parentNode.insertBefore(el, el.snIf.nextSibling) :
                            el.snIf.parentNode.appendChild(el);
                    }
                    break;
                case "sn-if":
                case "sn-else-if":
                    var val = self.executeFunction(attrsBinding[key], data);

                    if (util.isFalse(val)) {
                        if (el.parentNode) {
                            el.parentNode.removeChild(el);
                        }
                        return;

                    } else {
                        if (!el.parentNode) {
                            el.snIf.nextSibling ?
                                el.snIf.parentNode.insertBefore(el, el.snIf.nextSibling) :
                                el.snIf.parentNode.appendChild(el);
                        }
                    }
                    break;
                default:
                    keys.push(key);
                    break;
            }
        }

        var attr;
        for (var i = 0, n = keys.length; i < n; i++) {

            attr = keys[i];

            var val = self.executeFunction(attrsBinding[attr], data);

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
                                val.forEach(function(item) {
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

                case 'sn-visible':
                    el.style.display = util.isFalse(val) ? 'none' : val == 'block' || val == 'inline' || val == 'inline-block' ? val : '';
                    break;
                case 'display':
                    el.style.display = util.isFalse(val) ? 'none' : val == 'block' || val == 'inline' || val == 'inline-block' ? val : '';
                    break;
                case 'sn-display':
                    var $el = $(el);
                    var isInitDisplay = true;
                    if (!$el.hasClass('sn-display')) {
                        isInitDisplay = false;
                        $el.addClass('sn-display')[0].clientHeight;
                    }
                    var display = util.isFalse(val) ? 'none' : val == 'block' || val == 'inline' || val == 'inline-block' ? val : '';

                    if (display == 'none') {
                        if (!$el.hasClass('sn-display-hide')) {

                            var onHide = function() {
                                if ($el.hasClass('sn-display-hide'))
                                    $el.hide();
                            }
                            $el.addClass('sn-display-hide')
                                .one($.fx.transitionEnd, onHide);
                            setTimeout(onHide, 300);
                        }

                    } else if (!isInitDisplay || $el.hasClass('sn-display-hide')) {
                        $el.css({
                            display: display
                        });
                        el.clientHeight;

                        $el.removeClass('sn-display-hide');
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
                case 'disabled':
                    (el[attr] = !!val) ? el.setAttribute(attr, attr) : el.removeAttribute(attr);
                    break;
                case 'src':
                    el.src = val;
                    break;
                case 'sn-src':
                    if (el.getAttribute('sn-' + this.cid + 'load') || el.getAttribute('sn-' + this.cid + 'error'))
                        $(el).one('load error', this._handleEvent);

                    if (el.src) {
                        el.src = val;

                    } else {
                        $(el).one('load error', function(e) {
                            $(this).animate({
                                opacity: 1
                            }, 200);

                        }).css({
                            opacity: 0

                        }).attr({
                            src: val
                        });
                    }
                    break;

                case 'classname':
                case 'class':
                    el.className = val;
                    break;
                default:
                    val === null ? el.removeAttribute(attr) : el.setAttribute(attr, val);
                    break;
            }
        }

    },

    updateRepeatElement: function(el) {

        var self = this;
        var repeatSource = el.snRepeatSource;
        var collection = el.snCollection;
        var model;
        var offsetParent = repeatSource.offsetParent;
        var orderBy = repeatSource.orderBy;

        var parentSnData = {};

        if (repeatSource.parent) {
            closestElement(el, function(parentNode) {
                if (parentNode.snRepeatSource == repeatSource.parent && parentNode.snData) {
                    Object.assign(parentSnData, parentNode.snData);
                    return true;
                }
            });
        }

        var collectionData;

        if (repeatSource.isFn) {

            collectionData = this.executeFunction(repeatSource.fid, this.formatData(parentSnData, el));
        }

        if (!collection) {

            if (repeatSource.isGlobal) {
                model = this.$global;

            } else if (!offsetParent) {
                model = this;

            } else {
                closestElement(el, function(parentNode) {
                    if (parentNode.snRepeatSource == offsetParent) {
                        model = parentNode.snModel;
                        return true;
                    }
                })
            }

            if (repeatSource.isFn) {
                collection = new Collection(this, repeatSource.collectionKey, collectionData);

            } else {
                collection = model && model.findByKey(repeatSource.collectionKey);
            }

            if (!collection) return;

            el.snCollection = collection;

        } else if (repeatSource.isFn) {
            collection.set(collectionData);
        }

        var elements = el.snElements || (el.snElements = []);
        var list = [];
        var cursorElem = el;
        var elementsLength = elements.length;
        var elemContain = {};

        collection.each(function(model) {
            var elem;
            var elemIndex = -1;
            var snData;
            var isInData = true;
            var ifElement;

            for (var j = 0; j < elementsLength; j++) {

                if (elements[j].snModel == model) {
                    elemContain[j] = true;
                    elem = elements[j];
                    elemIndex = j;
                    break;
                }
            }

            if (!elem) {
                snData = Object.assign({}, parentSnData);
                snData[repeatSource.alias] = model;

            } else {
                snData = elem.snData;
            }

            if (repeatSource.filter) {
                isInData = repeatSource.filter(self.formatData(elem, snData));
            }

            if (isInData) {

                if (!elem) {
                    elem = cloneRepeatElement(repeatSource.source, snData);

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

        if (orderBy) {

            if (typeof orderBy == 'string') {
                list.sort(this[orderBy]);

            } else {
                orderBy = orderBy.map(function(item) {
                    if (typeof item === 'number') {

                        return self.executeFunction(item, self.formatData(parentSnData, el));
                    }
                    return item;
                });


                list.sort(function(am, bm) {
                    var ret = 0;
                    var isDesc;
                    var sort;
                    var a, b;

                    for (var i = 0; i < orderBy.length; i += 2) {
                        sort = orderBy[i];
                        isDesc = orderBy[i + 1] == false;

                        a = am.model.data[sort];
                        b = bm.model.data[sort];

                        ret = isDesc ? (a > b ? -1 : a < b ? 1 : 0) : (a > b ? 1 : a < b ? -1 : 0);

                        if (ret != 0) return ret;
                    }

                    return ret;
                });
            }
        }

        list.forEach(function(item, index) {
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

    updateViewNextTick: function() {
        if (!this._nextTick) {
            this._nextTick = this._updatingView ? 1 : requestAnimationFrame(this.updateView);
        }
    },

    updateView: function() {
        this._updatingView = true;
        this.trigger('datachanged');
        this.viewWillUpdate && this.viewWillUpdate();

        console.time('updateView');

        var self = this;

        do {
            this._nextTick = null;
            this.refs = {};

            eachElement(this.$el, function(el) {
                if (el.snViewModel && el.snViewModel != self || self._nextTick) return false;

                return updateNode(self, el);
            });

        } while (this._nextTick);

        console.timeEnd('updateView');
        this._updatingView = false;

        this.viewDidUpdate && this.viewDidUpdate();
        this.trigger('viewDidUpdate');
    },

    bind: function(el) {

        var self = this;
        var $el = $(el).on('input change blur', '[' + this.snModelKey + ']', function(e) {
            var target = e.currentTarget;

            switch (e.type) {
                case 'change':
                case 'blur':
                    switch (target.tagName) {
                        case 'TEXTAREA':
                            return;
                        case 'INPUT':
                            switch (target.type) {
                                case 'hidden':
                                case 'radio':
                                case 'checkbox':
                                case 'file':
                                    break;
                                default:
                                    return;
                            }
                            break;
                    }
                    break;
            }

            self.setDataByElement(target, target.getAttribute(self.snModelKey), target.value);
        });

        this._bindElement($el);

        self.$el = (self.$el || $()).add($el);

        $el.each(function() {
            this.snViewModel = self;
        })

        return this;
    },

    _bindElement: function($el) {
        var self = this;

        this._codes = [];

        eachElement($el, function(node) {

            if (node.snViewModel) return false;

            if (node.nodeType != 8)
                self.twoWayBinding(node);

            var parentRepeatSource;
            for (var parentNode = (node.snIf || node).parentNode; parentNode && !parentNode.snViewModel; parentNode = (parentNode.snIf || parentNode).parentNode) {

                if (parentNode.snRepeatSource) {
                    parentRepeatSource = parentNode.snRepeatSource;
                    break;
                }
            }

            if (RepeatSource.isRepeatNode(node)) {
                if (node.snIf) throw new Error('can not use sn-if and sn-repeat at the same time!!please use filter instead!!');

                var nextSibling = node.nextSibling;
                var repeatSource = new RepeatSource(self, node, parentRepeatSource);

                node.snRepeatSource = repeatSource;

                return nextSibling;

            } else if (node.snIf) {
                return node.snIf.nextSibling;
            }
        });

        for (var key in EVENTS) {
            var eventName = EVENTS[key];
            var attr = '[sn-' + self.cid + eventName + ']';

            $el.on(eventName, attr, this._handleEvent)
                .filter(attr)
                .on(eventName, this._handleEvent);
        }

        var fns = new Function('return [' + this._codes.join(',') + ']')();

        fns.forEach(function(fn) {
            self.fns.push(fn);
        });
    },

    _bindNewNode: function(newNode) {

        newNode = $(newNode);

        newNode.each(function() {
            if (this.snViewModel)
                throw new Error("can not insert or append binded node!");
        });

        this._bindElement(newNode);

        this.updateViewNextTick();

        return newNode;
    },

    _checkOwnNode: function(node) {
        if (typeof node == 'string') {
            node = this.$el.find(node);

            if (!node.length)
                throw new Error('is not own node');

        } else {

            this.$el.each(function() {
                if (!$.contains(this, node))
                    throw new Error('is not own node');
            });
        }
        return node;
    },

    isOwnNode: function(node) {
        if (typeof node == 'string') {
            return !this.$el.find(node).length;

        } else {
            var flag = true;
            this.$el.each(function() {
                if (!$.contains(this, node)) return false;
            });
            return flag;
        }
    },

    before: function(newNode, referenceNode) {

        referenceNode = this._checkOwnNode(referenceNode);

        return this._bindNewNode(newNode)
            .insertBefore(referenceNode);
    },

    after: function(newNode, referenceNode) {
        referenceNode = this._checkOwnNode(referenceNode);

        return this._bindNewNode(newNode)
            .insertAfter(referenceNode);
    },

    append: function(newNode, parentNode) {
        parentNode = this._checkOwnNode(parentNode);

        return this._bindNewNode(newNode)
            .appendTo(parentNode);
    },

    prepend: function(newNode, parentNode) {
        parentNode = this._checkOwnNode(parentNode);

        return this._bindNewNode(newNode)
            .prependTo(parentNode);
    },

    next: function(cb) {
        return this._nextTick ? this.one('viewDidUpdate', cb) : cb.call(this);
    },

    destroy: function() {
        this.$el.off('input change blur', '[' + this.snModelKey + ']')
            .each(function() {
                this.snViewModel = null;
            });

        for (var key in EVENTS) {
            var eventName = EVENTS[key];
            var attr = '[sn-' + this.cid + eventName + ']';

            this.$el.off(eventName, attr, this._handleEvent);
        }

        for (var i = 0, len = viewModelList.length; i < len; i++) {
            if (viewModelList[i] == this) {
                viewModelList.splice(i, 1);
                break;
            }
        }

        var children = this._linkedModels;
        if (children) {
            for (var i = 0, len = children.length; i < len; i++) {
                var link = children[i];
                var childModel = link.childModel;
                var linkedParents = childModel._linkedParents;

                linkedParents.splice(linkedParents.indexOf(link), 1);
                childModel.root.off(LINKEDCHANGE + ':' + childModel.cid, link.cb);
            }
        }

    }
}

ViewModelProto.then = ViewModelProto.next;

ViewModel.prototype = Object.assign(Object.create(ModelProto), ViewModelProto);
Event.mixin(ViewModel);

ViewModel.extend = util.extend;


var globalVM = new ViewModel;

globalVM.updateView = function() {

    viewModelList.forEach(function(viewModel) {
        var refs = {};

        eachElement(viewModel.$el, function(el) {
            if (el.snViewModel && el.snViewModel != viewModel) return false;

            if (el.snIsGlobal) {
                if (el.nodeType == 1) {
                    var ref = el.getAttribute('ref');
                    if (ref && !refs[ref]) {
                        viewModel.refs[ref] = null;
                        refs[ref] = true;
                    }
                }
                return updateNode(viewModel, el);
            }
        });
    });

    globalVM._nextTick = null;
};

ViewModel.prototype.$global = globalVM;


exports.global = globalVM;

exports.ViewModel = exports.Model = ViewModel;

exports.createModel = function(props) {
    var model = Object.assign(new ViewModel, props);

    if (props && props.defaultData) model.set(props.defaultData);

    return model;
}


exports.Collection = Collection;

exports.createCollection = function(props) {
    var model = Object.assign(new Collection, props);

    if (props && props.defaultData) model.set(props.defaultData);

    return model;
}
