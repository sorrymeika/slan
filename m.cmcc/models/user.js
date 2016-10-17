var vm = require('core/model2');
var util = require('util');
var $ = require('$');

var user = vm.createModel({
    defaultData: sl.isDev ? {
        user_id: 30001,
        user_name: '我我我',
        avatars: "images/logo.png",
        sign_text: '独特的人',
        hometown: '福建',
        address: '福建'

    } : util.store('user')
});

module.exports = user;