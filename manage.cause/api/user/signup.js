var util = require('../../../core/util');
var Validator = require('../../../core/validator');
var userModel = require('../models/user');
var causedb = require('../data/causedb');
var md5 = require('../../../util/md5').md5;

module.exports = function(req, res) {
    var valid = new Validator();
    var email = valid.email(req.body.email, false, "email can not be empty");
    var password = valid.password(req.body.password, 'password can not be empty');
    var validcode = valid.str(req.body.validcode, 'validcode can not be empty');
    var token = valid.str(req.body.token, 'token can not be empty');

    if (!token || !validcode || !userModel.captcha[token] || validcode.toLowerCase() != userModel.captcha[token].toLowerCase()) {
        valid.error('验证码错误');
    }

    userModel.captcha[token] && (delete userModel.captcha[token]);

    if (valid.result.success) {

        causedb.connect(function(err, conn) {
            if (err) {
                res.json({ success: false, msg: '连接失败' });
                return;
            }

            conn.query("select 1 from user where email=@p0 limit 0,1", [email], function(err, result) {
                if (err) {
                    res.json({ success: false, msg: '[500错误]exists' });
                    return;
                }

                if (result && result.length) {
                    console.log(result);
                    res.json({ success: false, msg: '该邮箱已被注册' });
                    return;
                }

                conn.query("insert into user set ?", {
                    email: email,
                    password: password

                }, function(err, result) {
                    if (err) {
                        res.json({ success: false, msg: '[500错误]insert' });
                        return;
                    }

                    var token = md5(email + password + util.formatDate(Date.now(), "yyyyMM"));

                    userModel.setToken(result.insertId, token);

                    res.json({
                        success: true,
                        user: {
                            id: result.insertId,
                            email: email,
                            token: token
                        }
                    });
                });

            });

        });

    } else {
        res.json(valid.result);
    }

};
