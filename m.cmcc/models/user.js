var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var user = vm.createModel({
    defaultData: util.store('user')
});

module.exports = user;