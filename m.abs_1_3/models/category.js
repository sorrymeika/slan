var api = require('models/api');
var model = require('core/model');
var util = require('util');
var $ = require('$');
var State = model.State;

var categoryAPI = new api.CategoryAPI({
    success: function (res) {
        util.store('categories', res.data);
        util.store('navs', res.data2);
    },
    error: function () {

    }
});

console.log(categoryAPI);

var Category = {
    get: function (callback) {

        var categories = State.data.categories;
        var fn = function (categories, navs) {

            State.set({
                categories: categories,
                navs: navs
            });
            callback(categories, navs);
        };

        if (!categories && !(categories = util.store('categories'))) {
            categoryAPI.load(function (err, res) {
                fn(res.data, res.data2);
            });
        } else {
            fn(categories, util.store('navs'));
        }
    },

    list: function (callback) {
        this.get(function (categories, navs) {

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

            callback(list, navs);
        });
    },

    request: function (callback) {
        var self = this;

        categoryAPI.load(callback);

        return this;
    }
};

module.exports = Category;