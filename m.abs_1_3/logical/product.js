var Loader = require('widget/loader');
var userModel = require('models/user');
var api = require('models/api');

var Product = {
    getSizeByPrhId: function (prhId, callback, $el) {
        var user = userModel.get();

        new api.ProductColorAndSpec({
            $el: $el,
            params: {
                id: prhId
            }

        }).load(callback);
    }
};

module.exports = Product;