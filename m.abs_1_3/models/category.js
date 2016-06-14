var api = require('models/api');
var model = require('core/model');
var util = require('util');
var $ = require('$');
var State = model.State;

var categoryAPI = new api.CategoryAPI({
    success: function (res) {
        util.store('categories', res.data);
    },
    error: function () {

    }
});

console.log(categoryAPI);

var Category = {
    get: function (callback) {

        var categories = State.data.categories;
        var fn = function (err, categories) {

            State.set({
                categories: categories
            });
            callback(categories);
        };

        if (!categories && !(categories = util.store('categories'))) {
            categoryAPI.request(fn);
        } else {
            fn(null, categories);
        }
    },

    list: function (callback) {
        this.get(function (categories) {

            var list = util.find(categories, function (item) {
                item.children = util.find(categories, function (sub) {
                    if (sub.PCG_PARENT_ID == item.PCG_ID) {
                        sub.children = util.find(categories, function (child) {
                            return child.PCG_PARENT_ID == sub.PCG_ID
                        });
                        return true;
                    }
                    return false;
                });
                return item.PCG_DEPTH == 1;
            });

            callback(list);
        });
    },

    request: function (callback) {
        var self = this;

        categoryAPI.load(callback);

        return this;
    }
};

module.exports = Category;