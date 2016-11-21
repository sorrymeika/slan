var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var friends = vm.createModel({
    defaultData: {
        contacts: [],
        friends: []
    },
    getFriends: function () {
        return this._('friends');
    },
    getContacts: function () {
        return this._('contacts');
    }
});

module.exports = friends;