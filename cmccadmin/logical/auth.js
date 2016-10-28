var util = require('util');
var aes = require('util/aes');
var RSA = require('util/rsa');
var md5 = require('util/md5');
var vm = require('core/model2');
var Http = require('core/http');
var Form = require('components/form');

var rsaPublicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCczoLxjmckSX9oJBNSXY1rKWK5\
urp3WzPiLhctBOahVSaSeWhVKif1Q1VSfDhnEw93pNRX6vxwsZ215x8iAFU/Xp8q\
Pdj+S3mVjefkHZQRBohnJ1Bs7qGf+794yKOXyeUOUXqMbeIBuZu7MmZkNcnjLU8r\
Y9SWbWtJmH6pjEYS5QIDAQAB";


var _request = Http.prototype._request;

var getSign = function () {
    var admin = auth.getAdmin();
    var _tk = auth.getAuthToken();

    if (admin && _tk) {
        var key = aes.genKey();

        return {
            _sign: rsa.encrypt(admin.adminId + '|' + key),
            _tk: aes.encrypt(key, _tk)
        }
    }
}

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

var _submit = Form.prototype.submit;

Form.prototype.submit = function (success, error) {

    var sign = getSign();
    if (sign && this.$el.find('[name="_tk"]').length == 0) {
        this.$el.prepend($('<input type="hidden" name="_tk" />').val(sign._tk))
            .prepend($('<input type="hidden" name="_sign" />').val(sign._sign));

        this.set(sign);
    }

    _submit.call(this, success, error);
}



var _atk;
var rsa = new RSA();
rsa.setPublicKey(rsaPublicKey);

vm.Global.set(util.store('admin'));

var auth = {

    clearAuth: function () {

        localStorage.removeItem('__tk');
        localStorage.removeItem('admin');
    },

    setAuthToken: function (tk) {
        localStorage.setItem('__tk', aes.decrypt(this.getAESKey(), tk));
    },

    getAuthToken: function () {
        return localStorage.getItem('__tk');
    },

    getAdmin: function () {
        return util.store('admin');
    },

    setAdmin: function (admin) {

        console.log(admin);

        vm.Global.set(admin);

        util.store('admin', admin);
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