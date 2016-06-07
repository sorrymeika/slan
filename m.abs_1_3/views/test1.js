define("views/test3", ['./test2'], function (require,exports,module) {
    require('./test2');
    
    
    module.exports = {};
});

define("views/test4", ['./test2'], function (require,exports,module) {
    require('./test2');
    
    
    module.exports = {};

});

define("./test0", ['./test2'], function (require,exports,module) {
    require('./test2');
    module.exports = {};

})

