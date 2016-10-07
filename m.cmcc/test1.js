
define("test1", function(require, exports, module) {

    module.exports = {
        asf: 1
    }
});

define("test5", ["test2"], function(require, exports, module) {
    require("test2");

    module.exports = {
        asf: 1
    }
})