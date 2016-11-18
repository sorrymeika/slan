var util = require('util');
var vm = require('core/model2');
var Http = require('core/http');
var Event = require('core/event');
var Promise = require('promise');


var yunmi = Event.mixin({
  

    getYunmi: function () {
        return Http.post("/user_yunmi/getYunmi");
    }
});


module.exports = yunmi;