var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var appconfig = vm.createModel({
    defaultData: util.store('app_config')
});

appconfig.on('datachanged', function () {

    util.store('app_config', this.data);
});

module.exports = appconfig;