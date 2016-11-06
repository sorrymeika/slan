var util = require('util');
var model2 = require('core/model2');
var Http = require('core/http');
var Promise = require('promise');

var district = {
    getCountries: function () {
        return Http.post('/country/getAll');
    },

    getProvinces: function (country_id) {
        return Http.post('/province/filter', {
            country_id: country_id
        });
    },

    getCities: function (province_id) {
        return Http.post('/city/filter', {
            province_id: province_id
        });
    }
}

module.exports = district;
