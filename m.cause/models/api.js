var Loading = require('widget/loading');

var API = Loading.extend({
    baseUri: $('meta[name="api-base-url"]').attr('content')
});
exports.API = API;
