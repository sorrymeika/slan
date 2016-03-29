var LinkList = require('./linklist');
var slice = Array.prototype.slice;
var rparam = /^\$(\d+)$/;

var getCallbackParams = function (args, parameters, fn) {
    var newArgs = [];

    for (var i = 0, n = args.length, arg; i < n; i++) {
        arg = args[i];
        newArgs.push(typeof arg === 'string' ? (rparam.test(arg) ? parameters[parseInt(arg.match(rparam)[1])] : arg.replace(/^\$\$/, '$')) : arg);
    }

    newArgs.push(fn);

    return newArgs;
}

var Promise = function (args, callback, ctx) {
    if (!(this instanceof Promise))
        return new Promise(args, callback, ctx);

    var self = this;

    this.queue = new LinkList();
    this.state = 2;
    this.resolveSelf = function () {
        self.resolve.apply(self, arguments);
    };

    if (!callback && typeof args == 'number') {
        this.state = 0;
        this.start(args);

    } else if (args) {
        this.state = 0;
        this.then(args, callback, ctx);
    }
}

Promise.prototype = {
    reject: function (reason) {
        this.resolve(reason || 'unknow error', null);
    },

    resolve: function () {
        var that = this,
            args = slice.call(arguments),
            then = that.queue.shift(),
            next,
            ctx,
            promise;

        if (then) {
            that.state = 1;
            next = then[0];
            ctx = then[1];

            if (next instanceof Promise) {
                next.then(that.resolveSelf);

            } else if (typeof next == 'function') {
                promise = next.apply(ctx, args);

                if (promise instanceof Promise) {
                    if (promise !== that) {
                        promise.then(that.resolveSelf);
                    }

                } else
                    that.resolve(null, promise);

            } else if (next instanceof Array) {
                var errors = [],
                    result = [],
                    count = 0;

                for (var i = 0, n = next.length; i < n; i++) {
                    (function (fn, i, n) {

                        if (typeof fn == 'function') {
                            fn = fn.apply(ctx, args);
                        }

                        if (fn instanceof Promise) {

                            fn.then(function (err, obj) {
                                if (err) errors[i] = err;

                                count++;
                                result[i] = obj;

                                if (count >= n) that.resolve(errors, result);
                            });

                        } else {
                            count++;
                            result[i] = fn;

                            if (count >= n) that.resolve(null, result);
                        }

                    })(next[i], i, n);
                }

            } else {
                that.resolve(null, args);
            }

        } else {
            that.state = 0;
        }

        return that;
    },
    when: function (fns, ctx) {
        if (!(fns instanceof Array))
            fns = [fns];

        this.queue.append([fns, ctx || this]);

        if (this.state != 1) {
            this.resolve();
        }

        return this;
    },

    map: function (argsList, callback, ctx) {
        var self = this,

            fn = function () {
                var parameters = arguments;

                self._count = argsList.length;
                self.result = [];
                self.errors = [];

                argsList.forEach(function (args, j) {
                    if (!(args instanceof Array)) args = [args];

                    callback.apply(this, getCallbackParams(args, parameters, function (err, res) {
                        self.next(j, err, res);
                    }));
                });

                return self;
            };

        self.queue.append([fn, ctx || this]);

        return self;
    },

    each: function (argsList, callback, ctx) {

        var self = this,
            fn = function () {
                self._count = argsList.length;
                self.result = [];
                self.errors = [];

                argsList.forEach(function (args, j) {

                    callback.apply(this, [j, args]);
                });

                return self;
            };

        self.queue.append([fn, ctx || this]);

        return self;
    },

    start: function (number) {
        var self = this,
            fn = function () {
                self._count = number;
                self.result = [];
                self.errors = [];
                return self;
            };

        self.queue.append([fn, this]);

        return self;
    },

    next: function (index, err, data) {
        this._count--;

        if (err)
            this.errors[index] = err;

        this.result[index] = data;

        if (this._count <= 0) {
            this.resolve(this.errors.length ? this.errors : null, this.result);
        }
    },

    bind: function (fn) {
        var self = this;

        return function () {
            self.then(slice.call(arguments), fn, this);
        }
    },

    then: function (args, callback, ctx) {
        var self = this,
            fn;

        if (!(args instanceof Array)) {
            ctx = callback;
            callback = args;
            args = null;

        } else {
            fn = callback;
            callback = function () {
                fn.apply(this, getCallbackParams(args, arguments, self.resolveSelf));
                return self;
            };
        }

        self.queue.append([callback, ctx || this]);

        if (!self.state) {
            self.resolve();
        }

        return self;
    }
};

Promise.resolve = function () {
    return new Promise().resolve();
}

module.exports = Promise;

/*
var promise=Promise(function () {
var that=this;

setTimeout(function () {
console.log('init');

that.resolve(null,'tes1t');

},2000);

return that;
});

promise.when(function () {
var dfd=Promise();

setTimeout(function () {
console.log('when');

dfd.resolve(null,'test');

},2000);

return dfd;
})
.then(function (err,result) {
setTimeout(function () {
console.log('then',err,result);

promise.resolve();

},1000);

return promise;
})
.then(function (err,result) {

setTimeout(function () {
console.log('end',err,result);

promise.resolve();

},500);

return promise;
});
*/