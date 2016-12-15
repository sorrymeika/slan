var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var user = vm.createModel({
    defaultData: util.store('user')
});

user.on('datachanged', function () {

    util.store('user', this.data);
});

module.exports = user;