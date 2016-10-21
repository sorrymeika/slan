var LinkList = require('./core/linklist');

function isThenable(thenable) {
    return thenable && typeof thenable.then === 'function';
}

function tryResolve(thenable, _resolve, _reject) {

    if (isThenable(thenable)) {
        thenable.then(_resolve, _reject);

    } else {
        try {
            if (typeof _resolve == 'function') {
                _resolve(thenable);
            }

        } catch (e) {
            _reject && _reject(e);
        }
    }
}

function resolve(thenable) {

    return new Promise(function (_resolve, _reject) {
        tryResolve(thenable, _resolve, _reject);
    });
}

function reject(value) {

    return new Promise(function (_resolve, _reject) {
        _reject(value);
    });
}

function catchAndContinue(e, onRejected, nextFulfilled, nextRejected) {

    if (typeof onRejected === 'function') {
        onRejected(e);
        nextFulfilled(null);

    } else {
        nextRejected(e);
    }
}

function subscribe(res, onFulfilled, onRejected, nextFulfilled, nextRejected) {
    var thenable;

    try {
        thenable = onFulfilled ? onFulfilled(res) : null;

    } catch (e) {
        catchAndContinue(e, onRejected, nextFulfilled, nextRejected);
        return;
    }

    tryResolve(thenable, nextFulfilled, nextRejected);
}

Promise.resolve = resolve;
Promise.reject = reject;

function Promise(callback, ctx) {
    if (!(this instanceof Promise))
        return new Promise(callback, ctx);

    var self = this;
    var queue = new LinkList();

    this.state = -1;
    this.queue = queue;

    callback(function (res) {

        self.state = 1;
        self._result = res;

        for (var next; next = queue.shift();) {
            subscribe(res, next.onFulfilled, next.onRejected, next.nextFulfilled, next.nextRejected);
        }

    }, function (e) {
        self.state = 0;
        self._error = e;

        for (var next; next = queue.shift();) {
            catchAndContinue(e, next.onRejected, next.nextFulfilled, next.nextRejected);
        }
    });
}

Promise.prototype = {
    then: function (onFulfilled, onRejected) {
        var self = this;

        return new Promise(function (nextFulfilled, nextRejected) {

            switch (self.state) {
                case -1:
                    self.queue.append({
                        nextFulfilled: nextFulfilled,
                        nextRejected: nextRejected,
                        onFulfilled: onFulfilled,
                        onRejected: onRejected
                    });
                    break;
                case 1:
                    subscribe(self._result, onFulfilled, onRejected, nextFulfilled, nextRejected);
                    break;
                case 0:
                    catchAndContinue(self._error, onRejected, nextFulfilled, nextRejected);
                    break;
            }
        });

    },

    'catch': function (onRejected) {
        return this.then(null, onRejected);
    }
};


Promise.all = function (all) {

    return this.each(all, null, false);
}


Promise.race = function (all) {

    return this.each(all, false, false);
}


Promise.some = function (some) {

    return this.each(some);
}

Promise.each = function (all, _resolve, _reject) {

    return new Promise(function (onFulfilled, onRejected) {

        var count = all.length;
        var results = [];
        var errors = [];

        var checkNext = function (data, onFinish, each, i) {

            return function (e) {

                if (count == -1) return;

                if (each === false || typeof each === 'function' && each(e, i) === false) {
                    count = -1;

                    onFinish(e);
                    return;
                }
                data[i] = e;

                count--;

                if (count == 0) {
                    if (errors.length) {
                        onRejected(errors);
                    }
                    if (results.length) {
                        onFulfilled(results);
                    }
                }
            }
        }

        all.forEach(function (item, i) {
            tryResolve(item, checkNext(results, onFulfilled, _resolve, i), checkNext(errors, onRejected, _reject, i));
        });
    });
}

module.exports = Promise;