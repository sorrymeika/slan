var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var business = vm.createModel({
    defaultData: util.store('business_model') || {
        list: []
    }
});

business.on('datachanged', function() {
    util.store('business_model', this.data);
});

module.exports = business;