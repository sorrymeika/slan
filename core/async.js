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


function done(async, err, res) {
    var doneSelf = async.doneSelf,
        then = async.queue.shift(),
        next,
        ctx,
        promise;

    if (then) {
        async.state = 1;

        next = then[0];
        ctx = then[1];

        if (next instanceof Async) {
            next.then(doneSelf);

        } else if (typeof next == 'function') {
            var nextReturn = next.call(ctx, err, res, doneSelf);

            if (nextReturn instanceof Async) {
                if (nextReturn !== async) {
                    nextReturn.then(doneSelf);
                }

            } else
                done(async, null, nextReturn);

        } else if (next instanceof Array) {
            var errors = [],
                result = [],
                count = 0;

            for (var i = 0, n = next.length; i < n; i++) {
                (function (fn, i, n) {

                    if (typeof fn == 'function') {
                        fn = fn.call(ctx, err, res, doneSelf);
                    }

                    if (fn instanceof Async) {

                        fn.then(function (err, obj) {
                            if (err) errors[i] = err;

                            count++;
                            result[i] = obj;

                            if (count >= n) done(async, errors, result);
                        });

                    } else {
                        count++;
                        result[i] = fn;

                        if (count >= n) done(async, null, result);
                    }

                })(next[i], i, n);
            }

        } else {
            done(async, null, args);
        }
    }
};

var Async = function (callback, ctx) {
    if (!(this instanceof Async))
        return new Async(callback, ctx);

    var self = this;

    this.queue = new LinkList();
    this.state = 2;

    this.doneSelf = function (err, res) {
        done(self, err, res);
    };

    if (!callback && typeof args == 'number') {
        this.state = 0;
        this.start(args);

    } else {
        this.state = 0;

        callback.call(ctx, this.doneSelf);
    }
}

Async.prototype = {

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

                    callback.call(this, j, args);
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
            this.done(this.errors.length ? this.errors : null, this.result);
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
                fn.apply(this, getCallbackParams(args, arguments, self.doneSelf));
                return self;
            };
        }

        self.queue.append([callback, ctx || this]);

        if (!self.state) {
            self.done();
        }

        return self;
    }
};

Async.done = function (data) {

    return new Async(function (done) {

        data instanceof Async ? data.await(done) : done(data);
    });
}

module.exports = Async;

/*
var promise=Async(function () {
var that=this;

setTimeout(function () {
console.log('init');

that.done(null,'tes1t');

},2000);

return that;
});

promise.when(function () {
var dfd=Async();

setTimeout(function () {
console.log('when');

dfd.done(null,'test');

},2000);

return dfd;
})
.then(function (err,result) {
setTimeout(function () {
console.log('then',err,result);

promise.done();

},1000);

return promise;
})
.then(function (err,result) {

setTimeout(function () {
console.log('end',err,result);

promise.done();

},500);

return promise;
});
*/