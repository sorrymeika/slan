var util = require('util');
var model2 = require('core/model2');


var messagesList = model2.createModel({
    defaultData: util.store('messagesList') || {
        list: []
    }
});

messagesList.on('datachanged', function () {
    util.store('messagesList', this.data);
});


module.exports = messagesList;