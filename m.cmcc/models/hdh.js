var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var HDH_MODEL_CACHE = 'HDH_MODEL_CACHE';

var hdh = vm.createModel({
    defaultData: util.store(HDH_MODEL_CACHE) || {
        subPhoneList: []
    },

    getSubPhoneList: function () {
        return this._('subPhoneList');
    },

    getSubInfo: function (subphone) {
        var first = this._('subPhoneList[subphone="' + subphone + '"][+]', {
            subphone: subphone
        });

        console.log(first);

        return first;
    }
});

hdh.on('datachanged', function () {
    util.store(HDH_MODEL_CACHE, this.data);
});

module.exports = hdh;