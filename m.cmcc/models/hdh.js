var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var user = vm.createModel({
    defaultData: util.store('cmcc_hdh')
});

user.on('datachanged', function () {

    util.store('cmcc_hdh', this.data);
});

module.exports = user;