var util = require('util');
var aes = require('util/aes');
var RSA = require('util/rsa');
var md5 = require('util/md5');
var vm = require('core/model2');
var userModel = require('models/user');
var Http = require('core/http');
var Loader = require('widget/loader');

var rsaPublicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCczoLxjmckSX9oJBNSXY1rKWK5\
urp3WzPiLhctBOahVSaSeWhVKif1Q1VSfDhnEw93pNRX6vxwsZ215x8iAFU/Xp8q\
Pdj+S3mVjefkHZQRBohnJ1Bs7qGf+794yKOXyeUOUXqMbeIBuZu7MmZkNcnjLU8r\
Y9SWbWtJmH6pjEYS5QIDAQAB";

var getSign = function () {
    var user = auth.getUser();
    var _tk = auth.getAuthToken();

    if (user && _tk) {
        var key = aes.genKey();

        return {
            _sign: rsa.encrypt(user.user_id + '|' + key),
            _tk: aes.encrypt(key, _tk)
        }
    }
}

var _request = Http.prototype._request;

Http.prototype._request = function (resolve, reject) {
    var sign = getSign();

    sign && this.setParam(sign);

    _request.call(this, resolve, reject);
}

Http.prototype.error = function (err) {
}

Http.prototype.success = function (res) {
    console.log(res);
}

var _load = Loader.prototype._request;

Loader.prototype._request = function (resolve, reject) {
    var sign = getSign();

    sign && this.setParam(sign);

    _load.call(this, resolve, reject);
}


var _atk;
var rsa = new RSA();
rsa.setPublicKey(rsaPublicKey);

var auth = {

    getSign: getSign,

    clearAuth: function () {
        localStorage.removeItem('__wtk');
        localStorage.removeItem('user');
    },

    setAuthToken: function (tk) {
        localStorage.setItem('__wtk', aes.decrypt(this.getAESKey(), tk));
    },

    getAuthToken: function () {
        return localStorage.getItem('__wtk');
    },

    getUser: function () {
        return util.store('user');
    },

    setUser: function (user) {
        userModel.set(user);
    },

    getAESKey: function () {
        if (!_atk) {
            _atk = aes.genKey();
        }
        return _atk;
    },

    md5: md5.md5,

    encryptParams: function (params) {
        var result = {};

        if (typeof params !== 'string') {
            params = JSON.stringify(params);
        }

        var akey = this.getAESKey();

        result.tk = rsa.encrypt(akey);
        result.params = aes.encrypt(akey, params);

        return result;
    }
}

module.exports = auth;