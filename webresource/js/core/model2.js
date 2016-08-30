
var $ = require('$'),
    util = require('util'),
    Base = require('./base'),
    Event = require('./event'),
    Component = require('./component');

var toString = {}.toString;
var ArrayProto = Array.prototype;

var eventsCache = [];
var changeEventsTimer;
var elementId = 0;

var snEvents = ['tap', 'click', 'change', 'focus', 'blur', 'transition-end'];
var snGlobal = ['this', '$', 'Math', 'new', 'Date', 'encodeURIComponent', 'window', 'document'];

var rfilter = /\s*\|\s*([a-zA-Z_0-9]+)((?:\s*(?:\:|;)\s*\({0,1}\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')\){0,1})*)/g;
var rparams = /\s*\:\s*([a-zA-Z_0-9\.-]+|'(?:\\'|[^'])*')/g;
var rvalue = /^((-)*\d+|true|false|undefined|null|'(?:\\'|[^'])*')$/;
var rrepeat = /([a-zA-Z_0-9]+)(?:\s*,(\s*[a-zA-Z_0-9]+)){0,1}\s+in\s+([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+){0,})(?:\s*\|\s*filter\s*\:\s*(.+?)){0,1}(?:\s*\|\s*orderBy\:(.+)){0,1}(\s|$)/;
var rmatch = /\{\{(.+?)\}\}/g;
var rvar = /'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/[img]*(?=[\)|\.|,])|\/\/.*|\bvar\s+[_,a-zA-Z0-9]+\s*\=|(^|[\!\=\>\<\?\s\:\(\),\%&\|\+\-\*\/\[\]]+)([\$a-zA-Z_][\$a-zA-Z_0-9]*(?:\.[a-zA-Z_0-9]+)*(?![a-zA-Z_0-9]*\())/g;
var rset = /([a-zA-Z_0-9]+(?:\.[a-zA-Z_0-9]+)*)\s*=\s*((?:\((?:'(?:\\'|[^'])*'|[^\)])+\)|'(?:\\'|[^'])*'|[^;])+?)(?=\;|\,|$)/g;
var rthis = /\b((?:this\.){0,1}[\.\w]+\()((?:'(?:\\'|[^'])*'|[^\)])*)\)/g;

var withData = function (repeat, content) {
    var code = 'var $el=$(el),root=model.root,$data=$.extend({},global,root.data,{$state:root.$state.data}';
    if (repeat) {
        code += ',{';
        for (var parent = repeat.parent, current = repeat; parent != null; current = parent, parent = parent.parent) {
            code += parent.alias + ':' + (current.isChild ? 'model.closest(\'' + parent.collectionName + '^child\').data' : 'root.upperRepeatEl(el,function(el){ if (el.snRepeat.repeat.alias == "' + parent.alias + '") return el.snModel.data; },null)') + ',';

            if (parent.loopIndexAlias) {
                code += parent.loopIndexAlias + ':function(){ for (var node=el;node!=null;node=node.parentNode) { if (node.snIndexAlias=="' + parent.loopIndexAlias + '") return node.snIndex } return ""},';
            }
        }
        code += repeat.alias + ':model.data';

        if (repeat.loopIndexAlias) {
            code += ',' + repeat.loopIndexAlias + ':function(){ for (var node=el;node!=null;node=node.parentNode) { if (node.snIndexAlias=="' + repeat.loopIndexAlias + '") return node.snIndex }return ""}';
        }
        code += '}';
    }

    code += ');with($data){' + content + '}';

    return code;
}

var genNullCheckJs = function (str) {
    var arr = str.split('.');
    var result = [];
    var code = '';
    var gb = arr[0] == '$state' ? arr.shift() : '$data';

    for (var i = 0; i < arr.length; i++) {
        result[i] = (i == 0 ? gb : result[i - 1]) + '.' + arr[i];
    }
    for (var i = 0; i < result.length; i++) {
        code += (i ? '&&' : '') + result[i] + '!==null&&' + result[i] + '!==undefined';
    }
    return '((' + code + ')?typeof ' + str + '==="function"?' + str + '():' + str + ':"")';
}

function everyElement(el, fn, transfer) {
    if (el.length) {
        for (var i = 0, len = el.length; i < len; i++) {
            everyElement(el[i], fn, transfer);
        }
        return;
    }

    var flag = fn(el, transfer);

    if (flag !== false && el.nodeType == 1 && el.childNodes.length) {

        for (var i = 0, len = el.childNodes.length; i < len; i++) {
            everyElement(el.childNodes[i], fn, flag || transfer);
        }
    }
}

function eachElement(el, fn, transfer) {
    if (el.length) {
        for (var i = 0, len = el.length; i < len; i++) {
            eachElement(el[i], fn, transfer);
        }
        return;
    }
    var stack = [];

    while (el) {
        fn(el, transfer);

        if (el.firstChild) {
            if (el.nextSibling) {
                stack.push(el.nextSibling);
            }
            el = el.firstChild;

        } else if (el.nextSibling) {
            el = el.nextSibling;

        } else {
            el = stack.pop();
        }
    }
}


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
    this._elements = {};

    this._collectionItemInitSet = this.parent instanceof Collection;
    this.set(data);
    this._collectionItemInitSet = false;
}

var ModelProto = {
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

    cover: function (key, val) {
        return this.set(true, key, val);
    },

    _fixParentData: function () {
        var parent = this.parent;
        parent.data[(parent instanceof Collection) ? parent.models.indexOf(this) : this._key] = this.data;
    },

    set: function (cover, key, val) {
        var self = this,
            origin,
            changed,
            attrs,
            model = self.model,
            parent,
            keys,
            coverChild = false,
            shouldTriggerEvent = !this.root._initSet && !this._collectionItemInitSet;

        if (typeof cover != "boolean")
            val = key, key = cover, cover = false;

        if (typeof key == 'object') {
            attrs = key;
        } else if (key === null) {
            !cover && (cover = true);
            attrs = {};

        } else if (typeof val == 'undefined') {
            val = key, key = '', parent = this.parent;

            this.data = val;
            this._fixParentData();

            shouldTriggerEvent && this.root._triggerChangeEvent(this.key, this);

            return this;

        } else {
            keys = key.split('.');

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
                            shouldTriggerEvent && this.root._triggerChangeEvent(eventName, this);
                            break;
                    }
                }
            }
        }

        shouldTriggerEvent && this.root._triggerChangeEvent(this.key, this);

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
    },

    _pushNode: function (source, node) {
        var id = source.snElementId || (source.snElementId = ++elementId);

        (this._elements[id] || (this._elements[id] = [])).push(node);
    }
}

Event.mixin(Model, ModelProto);

var Collection = Event.mixin(function (parent, attr, data) {

    this.models = [];

    this.cid = util.guid();

    this.parent = parent;
    this.key = parent.key ? (parent.key + "." + attr) : attr;
    this._key = attr;

    this.root = parent.root;

    this.data = [];
    parent.data[attr] = this.data;

    this.repeatSources = this.root.getRepeatSources(this.key);

    this.add(data);
}, {
        _change: function () {
            this.repeatSources.forEach(function (repeatSource) {
                if (repeatSource.isChild) {
                    repeatSource.parent.repeatElements.update(repeatSource);

                } else {
                    repeatSource.repeatElements.update();
                }
            })
        },

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
        first: function (fn) {
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
            var changes = [];

            if (!$.isArray(data)) {
                data = [data];
            }

            for (var i = 0, dataLen = data.length; i < dataLen; i++) {
                var dataItem = data[i];
                length = this.models.length;
                model = new Model(this, length, dataItem);
                this.models.push(model);
                changes.push(model);
            }

            this._change();

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

            this._change();
        },

        clear: function (data) {
            var models = this.models.slice();
            this.models.length = this.data.length = 0;

            this._change();
        }
    });


function RepeatSource(el, parent) {
    var self = this;
    var attrRepeat = el.getAttribute('sn-repeat');
    var match = attrRepeat.match(rrepeat);
    var collectionName = match[3];
    var attrs = collectionName.split('.');

    var options = {
        filters: match[4],
        orderBy: match[5]
    };
    this.alias = match[1];
    this.loopIndexAlias = match[2];
    this.key = attrs[attrs.length - 1];
    this.parent = parent;
    this.source = el;
    this.children = [];
    this.cid = util.guid();

    var replacement = document.createComment(collectionName);
    replacement.repeatSource = this;
    el.parentNode.replaceChild(replacement, el);

    this.replacement = replacement;

    while (parent) {
        if (parent.alias == attrs[0]) {
            attrs[0] = parent.collectionName + '^child';
            this.collectionName = attrs.join('.');
            this.isChild = true;
            break;
        }
        parent = parent.parent;
    }

    parent.appendChild(this);
}

RepeatSource.isRepeatNode = function (node) {
    return el.getAttribute('sn-repeat');
}

RepeatSource.prototype.appendChild = function (child) {
    this.children.push(child);
}

function RepeatElements(commentNode, source, collection) {
    var self = this;

    this.commentNode = commentNode;
    this.cursor = 0;
    this.source = source;
    this.collection = collection;
    this.length = collection.length;
}

RepeatElements.prototype = {

    update: function (child) {

        var fragment = document.createDocumentFragment();
        var list = this.elements;
        var repeat = this.repeat;
        var orderBy = repeat.orderBy;
        var root = this.collection.root;
        var source = this.source;
        var parentNode = this.replacement.parentNode;

        if (orderBy) {
            list.sort(function (a, b) {
                a = a.model.data[orderBy];
                b = b.model.data[orderBy];
                return a > b ? 1 : a < b ? -1 : 0;
            });
        }

        var prevEl;
        var changedEls = [];

        this.index = 0;
        this.replacement.snIndexAlias = repeat.loopIndexAlias;

        for (var i = 0, len = list.length; i < len; i++) {
            var item = list[i];
            var el;

            this.replacement.snIndex = this.index;

            if (repeat.filter === undefined || root.fns[repeat.filter].call(root, Filters, item.model, this.replacement)) {
                el = item.el ? item.el : (item.el = this.cloneNode(this.el || (this.el = this.cloneNode(repeat.el)), item.model));
                if (prevEl) {
                    if (prevEl.nextSibling != el) {
                        prevEl.nextSibling ?
                            prevEl.parentNode.insertBefore(el, prevEl.nextSibling) :
                            prevEl.parentNode.appendChild(el);
                    }

                } else if (!el.parentNode) {
                    fragment.appendChild(el);
                }
                prevEl = el;

                if (repeat.loopIndexAlias && el.snIndex !== this.index) {
                    el.snIndex = this.index;
                    changedEls.push(el);
                }
                this.index++;

            } else if (item.el && item.el.parentNode) {
                item.el.parentNode.removeChild(item.el);
            }
        }

        if (fragment.childNodes.length) parentNode.insertBefore(fragment, this.replacement);
    },

    cloneNode: function (el, model, parentNode) {
        var node = el.cloneNode(false);
        var len;
        var repeatSource;

        if (parentNode) parentNode.appendChild(node);

        //给repeat占位的CommentNode
        if (el.nodeType == 8 && el.repeatSource) {
            (this[this.cursor] || (this[this.cursor] = {}))[el.repeatSource.cid] = new RepeatElements(node, el.repeatSource);

        } else {

            if (el.nodeType == 1 && (len = el.childNodes.length)) {
                for (var i = 0; i < len; i++) {
                    this.cloneNode(el.childNodes[i], model, node);
                }
            }
        }
        return node;
    },

    each: function (fn, callback, reverse) {
        if (typeof callback !== 'function') reverse = callback, callback = null;
        for (var len = this.elements.length - 1, i = len; i >= 0; i--) {
            var index = reverse ? i : (len - i);
            if (fn.call(this, index, this.elements[index]) === false) {
                break;
            }
        }
        callback && callback.call(this);
        return this;
    },
    remove: function (start, count) {
        var self = this;
        if (typeof start == 'function') {
            for (var i = this.elements.length - 1; i >= 0; i--) {
                var item = this.elements[i];
                if (start(item, i)) {
                    this.elements.splice(i, 1)
                    this._removeEl(item.el);
                }
            }
        } else {
            this.elements.splice(start, count || 1).forEach(function (item) {
                self._removeEl(item.el);
            });
        }
        return this;
    },
    add: function (models) {
        var self = this;
        ($.isArray(models) ? models : [models]).forEach(function (model) {
            self.elements.push({
                model: model
            });
        })
        return this;
    },
    clear: function () {
        return this.each(function (i, item) {
            el.parentNode.removeChild(item.el);
        }, function () {
            this.elements.length = 0;

        }, true);
    }
}

function ViewModel(el, data) {
    if (typeof data === 'undefined' && (el == undefined || $.isPlainObject(el)))
        data = el, el = this.el;

    this.cid = util.guid();

    this.eventsCache = {};

    this.data = $.extend({}, data);
    this.model = {};
    this.repeats = {};
    this._fns = [];
    this.fns = [];
    this.refs = {};
    this.root = this;
    this._elements = {};

    el && this.bind(el);

    this._initSet = true;
    this.set(this.data);
    this._initSet = false;

    this.onDestroy && this.on('Destroy', this.onDestroy);

    this.initialize.call(this, el, data);
}

ViewModel.prototype = $.extend(Object.create(Model.prototype), {

    twoWayBinding: function (el) {

    },

    addRepeatSource: function (repeatSource) {
        var repeatSources = this.repeatSources[repeatSource.collectionName];
        !repeatSources && (repeatSources = []);
        repeatSources.push(repeatSource);
    },

    getRepeatSources: function (collectionName) {
        return this.repeatSources[collectionName];
    },

    bind: function (el) {
        var self = this;
        var elements = [];
        var snModelName = 'sn-' + self.cid + 'model';

        var $el = $(el).on('input change blur', '[' + snModelName + ']', function (e) {
            var target = e.currentTarget;
            var name = target.getAttribute(snModelName);

            //self._setByEl(target, name, target.value);
        });

        everyElement($el, function (node, transferRepeatSource) {
            if (node.snViewModel) return false;

            self.twoWayBinding(node);

            if (RepeatSource.isRepeatNode(node)) {
                var repeatSource = new RepeatSource(node, transferRepeatSource);

                self.addRepeatSource(repeatSource);

                return repeatSource;

            } else if (!transferRepeatSource) {
                render(node);
            }
        });

        self.$el = !self.$el ? $el : self.$el.add($el);

        $el.each(function () { this.snViewModel = self; })

        return this;
    }

});

ViewModel.extend = util.extend;

exports.State = ViewModel.prototype.$state = new ViewModel();

exports.ViewModel = ViewModel;
exports.Filters = Filters;


/*
    this.model = new model.ViewModel($('<div><div sn-repeat="item in data"><span>{{item.name}}</span><i sn-repeat="p in children">{{p.name}}</i></div></div>'), {
        data: [{
            name: '1234'
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