var api = require('models/base');
var model = require('core/model2');
var util = require('util');
var $ = require('$');

var Discovery = {
    get: function (id) {
        var discoveryList = util.store('DiscoveryList') || [];

        return id === undefined ? discoveryList : util.first(discoveryList, function (item) {
            return item.DCV_ID == id;
        });
    },

    clear: function () {
        util.store('DiscoveryList', null);
    },

    add: function (list) {
        var discoveryList = this.get();

        if (!$.isArray(list)) {
            list = [list];
        }

        for (var j = 0; j < list.length; j++) {
            var flag = true;
            var item = list[j];

            for (var i = 0; i < discoveryList.length; i++) {
                if (discoveryList[i].DCV_ID == item.DCV_ID) {
                    flag = false;
                    discoveryList[i] = item;
                    break;
                }
            }
            if (flag) {
                discoveryList.push(item);
            }
        }

        util.store('DiscoveryList', discoveryList);
        return this;
    }
};

module.exports = Discovery;