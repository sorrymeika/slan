var Loading = require('widget/loading');
var baseUri = $('meta[name="api-base-url"]').attr('content');
var API = Loading.extend({
    baseUri: baseUri
});

exports.url = function(url) {
    return /^http\:\/\//.test(url) ? url : (baseUri.replace(/\/$/, '') + '/' + url.replace(/^\//, ''))
}

exports.API = API;
