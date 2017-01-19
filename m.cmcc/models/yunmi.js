var vm = require('core/model2');
var util = require('util');
var $ = require('$');


var yunmiModel = vm.createModel({
    defaultData: {
        amount: util.store('YM_AMOUNT') || 0
    }
});

yunmiModel.on('change:amount', function (e, amount) {
    util.store('YM_AMOUNT', amount)
})

module.exports = yunmiModel;