
var Validator = function(data, options) {

    this.result = { success: true };
};

Validator.prototype.validate = function(value, options) {
    if (!options) return value;

    console.log(value);

    if ((value === '' || value === null || value === undefined) && (options.empty === false))
        this.error(options.emptyText);

    else if (value != "" && value != null && options.regex != null && !options.regex.test(value))
        this.error(options.regexText);

    return value;
}

Validator.prototype.str = Validator.prototype.string = function(value, empty, emptyText, regex, regexText) {
    if (typeof empty == "string") {
        regexText = regex, regex = emptyText, emptyText = empty, empty = false;

    } else if (empty instanceof RegExp) {
        regex = empty, regexText = emptyText, empty = true;
    }

    return this.validate(value, {
        empty: empty,
        emptyText: emptyText,
        regex: regex,
        regexText: regexText
    });
}


Validator.prototype.int = function(value, empty, emptyText) {
    return parseInt(this.validate(value, {
        empty: empty,
        emptyText: emptyText,
        regex: /^(\-){0,1}\d+(\.\d+){0,1}$/,
        regexText: '请填写数字'

    })) || 0;
}

Validator.prototype.email = function(value, empty, emptyText) {
    return this.validate(value, {
        empty: empty,
        emptyText: emptyText,
        regex: /^[-_a-zA-Z0-9\.]+@([-_a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,3}$/,
        regexText: '请填写正确的email'
    });
}

Validator.prototype.mobile = function(value, empty, emptyText) {
    return this.validate(value, {
        empty: empty,
        emptyText: emptyText,
        regex: /^1[0-9]{10}$/,
        regexText: '请填写正确的手机号'
    });
}

Validator.prototype.password = function(value, emptyText) {
    var result = this.validate(value, {
        empty: false,
        emptyText: emptyText
    });

    result && (result = require("../util/md5").md5(result));
    return result;
}

Validator.prototype.error = function(msg) {
    (this.result.errors || (this.result.errors = [])).push(msg);
    !this.result.msg && (this.result.msg = msg);
    this.result.success = false;
}

module.exports = Validator;
